"""Compare the TF-IDF baseline with pretrained sentence embeddings.

    pip install sentence-transformers
    python compare_embeddings.py

Uses exactly the same splits, threshold rule and evaluation code as train.py
(train.evaluate), so the numbers are directly comparable. Also measures how
long one request takes to classify on this machine's CPU, because the
embedding model would need a Python service while TF-IDF runs inside Node.

Writes ../data/model/embeddings.metrics.json, which the analytics dashboard
picks up automatically.
"""
import json
import platform
import statistics
import time
from datetime import datetime, timezone

from sklearn.linear_model import LogisticRegression

import train as base

MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def main():
    import torch
    from sentence_transformers import SentenceTransformer

    torch.manual_seed(base.SEED)
    enc = SentenceTransformer(MODEL, device="cpu")
    s = base.build_splits(base.load_raw())

    def embed(texts):
        return enc.encode(texts, normalize_embeddings=True, batch_size=64)

    tr = s["train"]
    clf = LogisticRegression(C=10, max_iter=3000, random_state=base.SEED).fit(embed([t for t, _ in tr]), [l for _, l in tr])
    ev, _ = base.evaluate(lambda texts: clf.predict_proba(embed(texts)), clf.classes_, s)

    # Single-request latency (what one API call would pay), median of 200.
    sample = [t for t, _ in s["test_in"][:200]]
    for t in sample[:10]:
        clf.predict_proba(embed([t]))  # warm up
    times = []
    for t in sample:
        t0 = time.perf_counter()
        clf.predict_proba(embed([t]))
        times.append((time.perf_counter() - t0) * 1000)

    out = {
        "version": "embeddings-minilm",
        "model": f"{MODEL} (frozen) + logistic_regression(C=10)",
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "dataset": "CLINC150 data_full",
        "train_size": len(tr),
        **ev,
        "latency_ms_p50": round(statistics.median(times), 2),
        "latency_ms_p95": round(sorted(times)[int(len(times) * 0.95)], 2),
        "latency_hardware": f"{platform.machine()} CPU, {platform.system()}, torch {torch.__version__}",
    }
    (base.OUT / "embeddings.metrics.json").write_text(json.dumps(out, indent=2))
    print(json.dumps({k: out[k] for k in ("version", "threshold", "latency_ms_p50")} | out["test"], indent=2))


if __name__ == "__main__":
    main()
