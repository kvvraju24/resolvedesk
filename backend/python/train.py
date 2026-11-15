"""Reproducible training + evaluation pipeline for the ResolveDesk baseline.

    python train.py                       # train v1 on CLINC150 only
    python train.py --corrections c.csv   # also train on exported agent corrections

Steps
1. Download CLINC150 (data_full.json) if it is not cached.
2. Build train / val / test splits for the 20 selected categories.
   Unsupported requests = CLINC oos split + every non-selected intent.
3. Fit TF-IDF (1-2 grams) + multinomial logistic regression.
4. Pick the review threshold on VALIDATION data only: the lowest confidence
   at which auto-routed requests are still >= TARGET_PRECISION correct
   (unsupported requests that get auto-routed count as errors).
5. Evaluate once on the held-out TEST split and write metrics JSON.
6. Export the model as plain JSON so the Node API can serve it without Python.

Agent corrections are only ever added to the training split, and any
correction whose text appears in val/test is dropped, so the final test set
stays independent of agent feedback.
"""
import argparse
import csv
import hashlib
import json
import random
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_recall_fscore_support

from categories import CATEGORIES, CATEGORY_TO_TEAM

HERE = Path(__file__).resolve().parent
RAW = HERE / "data" / "data_full.json"
OUT = HERE.parent / "data" / "model"
URL = "https://raw.githubusercontent.com/clinc/oos-eval/master/data/data_full.json"
SEED = 13
TARGET_PRECISION = 0.95
UNSUPPORTED = "__unsupported__"


def load_raw():
    if not RAW.exists():
        RAW.parent.mkdir(parents=True, exist_ok=True)
        print(f"downloading {URL}")
        urllib.request.urlretrieve(URL, RAW)
    return json.loads(RAW.read_text())


def split(raw, name, other_sample=None):
    """Return (texts, labels) with non-selected intents mapped to UNSUPPORTED."""
    rng = random.Random(SEED)
    inscope = [(t, l) for t, l in raw[name] if l in CATEGORY_TO_TEAM]
    other = [(t, UNSUPPORTED) for t, l in raw[name] if l not in CATEGORY_TO_TEAM]
    if other_sample is not None:
        other = rng.sample(other, other_sample)
    oos = [(t, UNSUPPORTED) for t, _ in raw[f"oos_{name}"]]
    return inscope, other, oos


def sweep(conf, correct, steps=101):
    """For each threshold: share auto-routed and share of those that are wrong."""
    rows = []
    for t in np.linspace(0, 1, steps):
        auto = conf >= t
        n = int(auto.sum())
        rows.append({
            "threshold": round(float(t), 2),
            "auto_rate": round(n / len(conf), 4),
            "auto_error_rate": round(float((~correct[auto]).mean()) if n else 0.0, 4),
        })
    return rows


def build_splits(raw):
    train, _, _ = split(raw, "train")
    val_in, val_other, val_oos = split(raw, "val", other_sample=100)
    test_in, test_other, test_oos = split(raw, "test")
    return {
        "train": train,
        "val": val_in + val_other + val_oos,
        "test_in": test_in, "test_other": test_other, "test_oos": test_oos,
    }


def evaluate(predict_proba, classes, s):
    """Pick the threshold on validation, then score every test split once.

    predict_proba(texts) -> (n, k) probabilities in the order of `classes`.
    Shared by train.py and compare_embeddings.py so their numbers are comparable.
    """
    def predict(rows):
        p = predict_proba([t for t, _ in rows])
        pred = np.asarray(classes)[p.argmax(1)]
        return pred, p.max(1), np.array([a == l for a, (_, l) in zip(pred, rows)])

    # ---- threshold on validation ----
    _, vc, vcorrect = predict(s["val"])
    val_curve = sweep(vc, vcorrect)
    ok = [r for r in val_curve if r["auto_rate"] > 0 and 1 - r["auto_error_rate"] >= TARGET_PRECISION]
    threshold = ok[0]["threshold"] if ok else 0.9

    # ---- final test evaluation ----
    tp, tc, tcorrect = predict(s["test_in"])
    auto = tc >= threshold
    prec, rec, f1, sup = precision_recall_fscore_support(
        [l for _, l in s["test_in"]], tp, labels=CATEGORIES, zero_division=0)
    per_cat = [{
        "category": c, "team": CATEGORY_TO_TEAM[c], "precision": round(float(prec[i]), 4),
        "recall": round(float(rec[i]), 4), "f1": round(float(f1[i]), 4), "support": int(sup[i]),
    } for i, c in enumerate(CATEGORIES)]

    _, oc, _ = predict(s["test_oos"])
    _, xc, _ = predict(s["test_other"])
    _, mc, mcorrect = predict(s["test_in"] + s["test_oos"])
    metrics = {
        "threshold": threshold,
        "threshold_rule": f"lowest validation threshold with auto-routed precision >= {TARGET_PRECISION}",
        "test": {
            "inscope_size": len(s["test_in"]),
            "accuracy": round(float(tcorrect.mean()), 4),
            "macro_f1": round(float(np.mean(f1)), 4),
            "auto_route_rate": round(float(auto.mean()), 4),
            "auto_routed_accuracy": round(float(tcorrect[auto].mean()), 4),
            "oos_size": len(s["test_oos"]),
            "oos_accepted_rate": round(float((oc >= threshold).mean()), 4),
            "other_intent_size": len(s["test_other"]),
            "other_intent_accepted_rate": round(float((xc >= threshold).mean()), 4),
            "mixed_auto_route_rate": round(float((mc >= threshold).mean()), 4),
            "mixed_auto_error_rate": round(float((~mcorrect[mc >= threshold]).mean()), 4),
        },
        "per_category": per_cat,
        "val_curve": val_curve,
        "test_curve": sweep(mc, mcorrect),
    }
    return metrics, (tp, tc)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--corrections", help="CSV with columns text,category exported from the app")
    ap.add_argument("--version", default=None)
    ap.add_argument("--out", default=str(OUT), help="output directory (default: ../data/model)")
    args = ap.parse_args()
    out_dir = Path(args.out)

    raw = load_raw()
    s = build_splits(raw)
    train, test_in = s["train"], s["test_in"]

    held_out = {t.lower().strip() for t, _ in s["val"] + test_in + s["test_other"] + s["test_oos"]}
    n_corr = 0
    if args.corrections:
        with open(args.corrections) as f:
            for row in csv.DictReader(f):
                text, cat = row["text"].strip(), row["category"]
                if cat in CATEGORY_TO_TEAM and text.lower() not in held_out:
                    train.append((text, cat))
                    n_corr += 1
        print(f"added {n_corr} agent corrections to TRAIN only")

    vec = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, min_df=2, lowercase=True)
    X = vec.fit_transform([t for t, _ in train])
    clf = LogisticRegression(C=10, max_iter=3000, random_state=SEED)
    clf.fit(X, [l for _, l in train])

    ev, (tp, tc) = evaluate(lambda texts: clf.predict_proba(vec.transform(texts)), clf.classes_, s)
    threshold = ev["threshold"]

    version = args.version or ("v2-corrections" if n_corr else "v1-baseline")
    metrics = {
        "version": version,
        "model": "tfidf(1-2gram,sublinear,min_df=2) + logistic_regression(C=10)",
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "dataset": "CLINC150 data_full",
        "categories": len(CATEGORIES),
        "train_size": len(train),
        "corrections_used": n_corr,
        **ev,
    }

    vocab = vec.vocabulary_
    terms = sorted(vocab, key=vocab.get)
    model = {
        "version": version,
        "type": "tfidf_logreg",
        "ngram_range": [1, 2],
        "sublinear_tf": True,
        "token_pattern": r"(?u)\b\w\w+\b",
        "terms": terms,
        "idf": [round(float(x), 6) for x in vec.idf_],
        "classes": list(clf.classes_),
        "coef": [[round(float(x), 5) for x in row] for row in clf.coef_],
        "intercept": [round(float(x), 5) for x in clf.intercept_],
        "category_to_team": CATEGORY_TO_TEAM,
        "threshold": threshold,
        # Parity fixtures: the Node test suite checks it reproduces these.
        "parity": [{"text": t, "label": str(p), "confidence": round(float(c), 4)}
                   for (t, _), p, c in list(zip(test_in, tp, tc))[:25]],
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{version}.json").write_text(json.dumps(model, separators=(",", ":")))
    (out_dir / f"{version}.metrics.json").write_text(json.dumps(metrics, indent=2))
    digest = hashlib.sha256((out_dir / f"{version}.json").read_bytes()).hexdigest()[:12]
    print(json.dumps({k: metrics[k] for k in ("version", "threshold")} | metrics["test"], indent=2))
    print(f"wrote {out_dir / (version + '.json')} sha256:{digest}")


if __name__ == "__main__":
    main()
