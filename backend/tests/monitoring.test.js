import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { DEMO_PASSWORD } from '../src/baseData.js';
import { EDGES, histogram, modelHealth, psi, referenceHistogram } from '../src/monitoring.js';

// Fresh in-memory app with `rows` inserted directly as [confidence, outcome].
// outcome: 'correct' | 'corrected' | 'rejected' | 'pending'
function appWith(rows) {
  const made = createApp({ dbFile: ':memory:' });
  const { db, ctx } = made;
  const customer = db.prepare("SELECT id FROM users WHERE role = 'customer' LIMIT 1").get().id;
  const t = ctx.threshold();
  const insReq = db.prepare(`INSERT INTO requests (customer_id, subject, body, category, status, routing)
    VALUES (?, 'subject', 'a request body', ?, ?, ?)`);
  const insPred = db.prepare(`INSERT INTO predictions (request_id, model_version, category, confidence, threshold)
    VALUES (?, ?, 'balance', ?, ?)`);
  for (const [conf, outcome] of rows) {
    const auto = conf >= t;
    const final = { correct: 'balance', corrected: 'transfer', rejected: null, pending: null }[outcome];
    const status = outcome === 'rejected' ? 'rejected' : outcome === 'pending' ? 'needs_review' : 'open';
    const id = Number(insReq.run(customer, final, status, auto ? 'auto' : 'manual').lastInsertRowid);
    insPred.run(id, ctx.model.version, conf, t);
  }
  return made;
}

const health = ({ db, ctx }) => modelHealth(db, { model: ctx.model, threshold: ctx.threshold() });

// n confidences spread over the bins in proportion to `shares`, at bin midpoints.
function spread(shares, n) {
  const out = [];
  shares.forEach((s, i) => {
    const mid = (EDGES[i] + Math.min(EDGES[i + 1], 1)) / 2;
    for (let k = 0; k < Math.round(s * n); k++) out.push(mid);
  });
  return out;
}

describe('drift statistics', () => {
  test('reference histogram from the validation curve sums to 1', () => {
    const { ctx } = createApp({ dbFile: ':memory:' });
    const ref = referenceHistogram(ctx.model.metrics.val_curve);
    assert.equal(ref.length, EDGES.length - 1);
    assert.ok(Math.abs(ref.reduce((a, b) => a + b, 0) - 1) < 1e-9);
    assert.ok(ref.every((p) => p >= 0));
  });

  test('histogram puts confidence 1.0 in the top bin', () => {
    assert.deepEqual(histogram([0, 0.29, 0.3, 1]), [0.5, 0.25, 0, 0, 0.25]);
  });

  test('PSI is 0 for identical distributions and grows with the shift', () => {
    const ref = [0.25, 0.1, 0.1, 0.15, 0.4];
    assert.equal(psi(ref, ref), 0);
    const small = psi(ref, [0.3, 0.1, 0.1, 0.15, 0.35]);
    const big = psi(ref, [0.7, 0.1, 0.05, 0.05, 0.1]);
    assert.ok(small > 0 && small < 0.1, `small shift ${small}`);
    assert.ok(big > 0.25, `big shift ${big}`);
  });
});

describe('model health', () => {
  test('too few predictions reports insufficient data, not drift', () => {
    const h = health(appWith([[0.95, 'correct'], [0.2, 'rejected']]));
    assert.equal(h.status, 'insufficient_data');
    assert.equal(h.current.psi, null);
    assert.equal(h.alerts[0].code, 'low_sample');
  });

  test('traffic that looks like validation is stable', () => {
    const { ctx } = createApp({ dbFile: ':memory:' });
    const ref = referenceHistogram(ctx.model.metrics.val_curve);
    const h = health(appWith(spread(ref, 300).map((c) => [c, 'correct'])));
    assert.equal(h.status, 'stable', JSON.stringify(h.alerts));
    assert.ok(h.current.psi < 0.1);
    assert.deepEqual(h.alerts, []);
  });

  test('a surge of low-confidence requests is flagged as drift and review overload', () => {
    const rows = [...Array(150).fill([0.15, 'rejected']), ...Array(50).fill([0.95, 'correct'])];
    const h = health(appWith(rows));
    assert.equal(h.status, 'drift');
    assert.ok(h.current.psi >= 0.25);
    const codes = h.alerts.map((a) => a.code);
    assert.ok(codes.includes('confidence_drift'));
    assert.ok(codes.includes('review_load'));
    assert.equal(h.current.unsupported_share, 0.75);
  });

  test('auto-routed mistakes found by agents lower the precision estimate', () => {
    const rows = [...Array(80).fill([0.95, 'correct']), ...Array(20).fill([0.95, 'corrected']),
      ...Array(40).fill([0.15, 'pending'])];
    const h = health(appWith(rows));
    assert.equal(h.current.auto_n, 100);
    assert.equal(h.current.auto_precision_est, 0.8);
    assert.ok(h.alerts.some((a) => a.code === 'auto_precision' && a.level === 'critical'));
  });

  test('old requests fall outside the window', () => {
    const made = appWith(Array(120).fill([0.15, 'rejected']));
    made.db.prepare("UPDATE requests SET created_at = datetime('now', '-10 days')").run();
    const h = health(made);
    assert.equal(h.current.n, 0);
    assert.equal(h.series.reduce((s, d) => s + d.n, 0), 120);
  });
});

describe('GET /monitoring', () => {
  test('staff only, validates the window and returns a series', async () => {
    const { app } = createApp({ dbFile: ':memory:' });
    const server = app.listen(0);
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const login = async (email) => (await (await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: DEMO_PASSWORD }),
    })).json()).token;
    const get = async (url, token) => fetch(base + url, { headers: { authorization: `Bearer ${token}` } });
    try {
      const customer = await login('alex@example.com');
      const agent = await login('maya@resolvedesk.dev');
      assert.equal((await get('/monitoring', customer)).status, 403);
      assert.equal((await get('/monitoring?days=0', agent)).status, 400);
      const r = await get('/monitoring?days=14', agent);
      assert.equal(r.status, 200);
      const body = await r.json();
      assert.equal(body.window_days, 14);
      assert.equal(body.series.length, 30);
      assert.equal(body.reference.source, 'validation');
    } finally {
      server.close();
    }
  });
});
