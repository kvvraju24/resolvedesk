// Model health and drift monitoring.
//
// The threshold was chosen on validation traffic (train.py). In production the
// model can quietly get worse: new kinds of requests arrive, the share of
// unsupported requests grows, or customers phrase things differently. This
// module compares recent live predictions with that validation reference:
//
// - Confidence drift: Population Stability Index (PSI) between the live
//   confidence histogram and the validation histogram.
// - Review load: share of requests sent to human review vs the share expected
//   from validation at the active threshold.
// - Estimated auto-route precision: auto-routed requests count as wrong when an
//   agent later corrected the category or rejected them as unsupported.
//
// No ground truth is needed for PSI and review load, so they catch problems
// before agents have reviewed anything.

export const TARGET_PRECISION = 0.95; // same rule train.py uses to pick the threshold
export const MIN_SAMPLE = 100; // PSI on fewer predictions is mostly noise
export const PSI_WATCH = 0.1;
export const PSI_DRIFT = 0.25;
export const REVIEW_MARGIN = 0.15;
export const RETRAIN_HINT = 20;
// Five confidence bins. Coarse bins keep PSI stable on a week of traffic.
export const EDGES = [0, 0.3, 0.5, 0.7, 0.9, 1];

const DAY_MS = 86_400_000;
const sqlTime = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
const dateOf = (s) => s.slice(0, 10);

// P(confidence >= t) read off a threshold sweep (train.py's val_curve).
function shareAtLeast(curve, t) {
  return curve.find((r) => r.threshold >= t - 1e-9)?.auto_rate ?? 0;
}

export function referenceHistogram(curve, edges = EDGES) {
  return edges.slice(0, -1).map((lo, i) => {
    const hi = i === edges.length - 2 ? 0 : shareAtLeast(curve, edges[i + 1]);
    return Math.max(0, shareAtLeast(curve, lo) - hi);
  });
}

export function histogram(values, edges = EDGES) {
  const counts = new Array(edges.length - 1).fill(0);
  for (const v of values) {
    let i = edges.findIndex((e, k) => k > 0 && v < e) - 1;
    if (i < 0) i = counts.length - 1; // v == 1.0 falls in the top bin
    counts[i]++;
  }
  return counts.map((c) => (values.length ? c / values.length : 0));
}

export function psi(reference, live, eps = 1e-4) {
  return reference.reduce((s, r, i) => {
    const a = Math.max(live[i], eps);
    const b = Math.max(r, eps);
    return s + (a - b) * Math.log(a / b);
  }, 0);
}

// Outcome of one request, judged after human review.
// null = still waiting for review, so we do not know yet.
function outcome(row) {
  if (row.status === 'rejected') return 'unsupported';
  if (!row.final) return null;
  return row.final === row.predicted ? 'correct' : 'corrected';
}

function summarize(rows, reference) {
  const n = rows.length;
  const auto = rows.filter((r) => r.routing === 'auto');
  const autoJudged = auto.filter((r) => outcome(r));
  const autoWrong = autoJudged.filter((r) => outcome(r) !== 'correct').length;
  const judged = rows.filter((r) => outcome(r));
  const live = histogram(rows.map((r) => r.confidence));
  return {
    n,
    review_share: n ? 1 - auto.length / n : null,
    unsupported_share: judged.length ? judged.filter((r) => outcome(r) === 'unsupported').length / judged.length : null,
    auto_n: auto.length,
    auto_precision_est: autoJudged.length ? 1 - autoWrong / autoJudged.length : null,
    mean_confidence: n ? rows.reduce((s, r) => s + r.confidence, 0) / n : null,
    psi: n >= MIN_SAMPLE ? psi(reference, live) : null,
    histogram: live,
  };
}

function alertsFor(w, expectedReview, corrections, days) {
  const alerts = [];
  if (w.n < MIN_SAMPLE) {
    alerts.push({ level: 'info', code: 'low_sample',
      message: `Only ${w.n} predictions in the last ${days} days. Drift checks need at least ${MIN_SAMPLE}.` });
  } else if (w.psi >= PSI_DRIFT) {
    alerts.push({ level: 'critical', code: 'confidence_drift',
      message: `Model confidence has shifted a lot from validation (PSI ${w.psi.toFixed(2)} ≥ ${PSI_DRIFT}). Incoming requests no longer look like the data the threshold was tuned on.` });
  } else if (w.psi >= PSI_WATCH) {
    alerts.push({ level: 'warning', code: 'confidence_drift',
      message: `Model confidence is drifting from validation (PSI ${w.psi.toFixed(2)} ≥ ${PSI_WATCH}). Keep an eye on it.` });
  }
  if (w.n >= MIN_SAMPLE && w.review_share > expectedReview + REVIEW_MARGIN) {
    alerts.push({ level: 'warning', code: 'review_load',
      message: `${Math.round(w.review_share * 100)}% of requests went to human review, against ${Math.round(expectedReview * 100)}% expected at this threshold.` });
  }
  if (w.auto_n >= 30 && w.auto_precision_est !== null && w.auto_precision_est < TARGET_PRECISION) {
    alerts.push({ level: 'critical', code: 'auto_precision',
      message: `Only ${(w.auto_precision_est * 100).toFixed(1)}% of reviewed auto-routed requests were right (target ${TARGET_PRECISION * 100}%). Raise the threshold or retrain.` });
  }
  if (corrections >= RETRAIN_HINT) {
    alerts.push({ level: 'info', code: 'retrain',
      message: `${corrections} agent corrections are available. Export them with export_corrections.py and retrain.` });
  }
  return alerts;
}

export function modelHealth(db, { model, threshold }, { days = 7, history = 30, now = new Date() } = {}) {
  const curve = model.metrics?.val_curve ?? [];
  const reference = referenceHistogram(curve);
  const expectedReview = 1 - shareAtLeast(curve, threshold);
  const since = sqlTime(new Date(now.getTime() - (history + days) * DAY_MS));
  const windowStart = sqlTime(new Date(now.getTime() - days * DAY_MS));

  const rows = db.prepare(`
    SELECT r.created_at, r.routing, r.status, r.category AS final, p.category AS predicted, p.confidence
    FROM requests r JOIN predictions p ON p.id = (SELECT MIN(id) FROM predictions WHERE request_id = r.id)
    WHERE r.created_at >= ? ORDER BY r.created_at`).all(since);
  const corrections = db.prepare('SELECT COUNT(*) AS n FROM corrections WHERE created_at >= ?').get(windowStart).n;

  const recent = rows.filter((r) => r.created_at >= windowStart);
  const current = summarize(recent, reference);

  // Daily series; PSI is computed over the trailing `days` window ending that day.
  const series = [];
  for (let k = history - 1; k >= 0; k--) {
    const day = dateOf(sqlTime(new Date(now.getTime() - k * DAY_MS)));
    const from = dateOf(sqlTime(new Date(now.getTime() - (k + days - 1) * DAY_MS)));
    const today = rows.filter((r) => dateOf(r.created_at) === day);
    const trailing = rows.filter((r) => dateOf(r.created_at) >= from && dateOf(r.created_at) <= day);
    const s = summarize(today, reference);
    series.push({
      date: day, n: s.n, review_share: s.review_share, unsupported_share: s.unsupported_share,
      auto_precision_est: s.auto_precision_est, mean_confidence: s.mean_confidence,
      psi: summarize(trailing, reference).psi,
    });
  }

  const alerts = alertsFor(current, expectedReview, corrections, days);
  const status = current.n < MIN_SAMPLE ? 'insufficient_data'
    : alerts.some((a) => a.level === 'critical') ? 'drift'
      : alerts.some((a) => a.level === 'warning') ? 'watch' : 'stable';

  return {
    status,
    model_version: model.version,
    threshold,
    window_days: days,
    reference: { source: 'validation', histogram: reference, review_share: expectedReview, target_precision: TARGET_PRECISION },
    bins: EDGES,
    current: { ...current, corrections },
    alerts,
    series,
    rules: { min_sample: MIN_SAMPLE, psi_watch: PSI_WATCH, psi_drift: PSI_DRIFT, review_margin: REVIEW_MARGIN },
  };
}
