'use client';
import { useEffect, useMemo, useState } from 'react';
import { label, pct } from './api';
import { useAuth, useToast } from './Providers';
import RequireRole from './RequireRole';

const W = 560, H = 240, PAD = 36;

// Auto-route rate and wrong-assignment rate as the threshold moves.
function TradeoffChart({ curve, threshold }) {
  const x = (t) => PAD + t * (W - PAD * 2);
  const y = (v) => H - PAD - v * (H - PAD * 2);
  const line = (key) => curve.map((p, i) => `${i ? 'L' : 'M'}${x(p.threshold).toFixed(1)},${y(p[key]).toFixed(1)}`).join('');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Automatic routing rate and error rate by confidence threshold" style={{ width: '100%', height: 'auto' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={PAD} x2={W - PAD} y1={y(v)} y2={y(v)} stroke="var(--border)" />
          <text x={PAD - 6} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">{v * 100}%</text>
          <text x={x(v)} y={H - PAD + 16} fontSize="11" textAnchor="middle" fill="var(--muted)">{v.toFixed(2)}</text>
        </g>
      ))}
      <path d={line('auto_rate')} fill="none" stroke="var(--brand)" strokeWidth="2.5" />
      <path d={line('auto_error_rate')} fill="none" stroke="var(--err)" strokeWidth="2.5" strokeDasharray="6 4" />
      <line x1={x(threshold)} x2={x(threshold)} y1={PAD - 8} y2={H - PAD} stroke="var(--text)" strokeWidth="1.5" />
      <text x={W / 2} y={H - 4} fontSize="11" textAnchor="middle" fill="var(--muted)">confidence threshold</text>
    </svg>
  );
}

function liveCurve(points) {
  return Array.from({ length: 101 }, (_, i) => {
    const t = i / 100;
    const auto = points.filter((p) => p.confidence >= t);
    return {
      threshold: t,
      auto_rate: points.length ? auto.length / points.length : 0,
      auto_error_rate: auto.length ? auto.filter((p) => !p.correct).length / auto.length : 0,
    };
  });
}

function Dashboard() {
  const { call, user } = useAuth();
  const notify = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [t, setT] = useState(0.5);
  const [source, setSource] = useState('test');

  useEffect(() => {
    call('/analytics').then((d) => { setData(d); setT(d.threshold); }, (e) => setError(e.message));
  }, [call]);

  const curve = useMemo(() => {
    if (!data) return [];
    if (source === 'live') return liveCurve(data.live.points);
    return data.offline?.[source === 'val' ? 'val_curve' : 'test_curve'] ?? [];
  }, [data, source]);

  if (error) return <div className="alert error" role="alert">{error}</div>;
  if (!data) return <p className="muted">Loading analytics…</p>;
  const at = curve[Math.round(t * 100)] ?? { auto_rate: 0, auto_error_rate: 0 };
  const off = data.offline;
  const live = data.live;

  const apply = async () => {
    try {
      const r = await call('/settings/threshold', { method: 'PUT', body: { threshold: t } });
      setData({ ...data, threshold: r.threshold });
      notify(`Threshold set to ${r.threshold.toFixed(2)} for new requests.`);
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  return (
    <div className="stack">
      <div className="grid">
        <div className="card"><div className="small muted">Test accuracy (20 categories)</div><div className="stat">{pct(off?.test.accuracy)}</div><div className="small muted">macro F1 {pct(off?.test.macro_f1)}</div></div>
        <div className="card"><div className="small muted">Routed automatically (test)</div><div className="stat">{pct(off?.test.auto_route_rate)}</div><div className="small muted">{pct(off?.test.auto_routed_accuracy)} of those correct</div></div>
        <div className="card"><div className="small muted">Unsupported accepted (CLINC oos)</div><div className="stat">{pct(off?.test.oos_accepted_rate)}</div><div className="small muted">other intents: {pct(off?.test.other_intent_accepted_rate)}</div></div>
        <div className="card"><div className="small muted">Live requests</div><div className="stat">{live.total}</div><div className="small muted">{pct(live.total ? live.auto / live.total : 0)} auto · {live.corrections} corrections</div></div>
      </div>

      <section className="card">
        <div className="row spread">
          <h2>Threshold tradeoff</h2>
          <select aria-label="Data source" style={{ width: 'auto' }} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="test">Held-out test (in-scope + oos)</option>
            <option value="val">Validation</option>
            <option value="live">Live requests ({live.points.length} reviewed)</option>
          </select>
        </div>
        <p className="small muted">
          A lower threshold routes more requests automatically but lets more wrong or unsupported ones through.
          The active threshold ({data.threshold.toFixed(2)}) was picked on validation data: the lowest value with ≥95% correct auto-routing.
        </p>
        <TradeoffChart curve={curve} threshold={t} />
        <div className="row small" style={{ gap: 20 }}>
          <span><span style={{ color: 'var(--brand)' }}>━</span> routed automatically</span>
          <span><span style={{ color: 'var(--err)' }}>╍</span> auto-routed but wrong</span>
        </div>
        <label htmlFor="threshold" style={{ marginTop: 16 }}>Threshold: {t.toFixed(2)}</label>
        <input id="threshold" type="range" min="0" max="1" step="0.01" value={t} onChange={(e) => setT(Number(e.target.value))} />
        <div className="grid" style={{ marginTop: 12 }}>
          <div><div className="small muted">Routed automatically</div><div className="stat">{pct(at.auto_rate)}</div></div>
          <div><div className="small muted">Of those, wrong</div><div className="stat">{pct(at.auto_error_rate)}</div></div>
          <div><div className="small muted">Sent to agents</div><div className="stat">{pct(1 - at.auto_rate)}</div></div>
        </div>
        {user.role === 'admin' && (
          <button className="btn primary" style={{ marginTop: 12 }} disabled={t === data.threshold} onClick={apply}>Apply {t.toFixed(2)} to new requests</button>
        )}
      </section>

      {off && (
        <section className="card">
          <h2>Per-category performance (test set)</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Category</th><th>Team</th><th>Precision</th><th>Recall</th><th>F1</th></tr></thead>
              <tbody>
                {[...off.per_category].sort((a, b) => a.f1 - b.f1).map((c) => (
                  <tr key={c.category}><td>{label(c.category)}</td><td>{c.team}</td><td>{pct(c.precision)}</td><td>{pct(c.recall)}</td><td>{pct(c.f1)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="card">
        <h2>Model comparison</h2>
        {data.comparisons.length < 2 && <p className="small muted">Run <code>python compare_embeddings.py</code> to add the pretrained-embedding model here.</p>}
        <p className="small muted">
          Same splits and threshold rule for every model. &ldquo;Mixed&rdquo; is the test set with 600 in-scope and 1,000 unsupported requests:
          a model that is better at classifying can still be worse at refusing what it does not know.
        </p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Version</th><th>Accuracy</th><th>Auto-routed</th><th>Auto accuracy</th><th>OOS accepted</th><th>Other intents accepted</th><th>Mixed auto error</th><th>Threshold</th></tr></thead>
            <tbody>
              {data.comparisons.map((m) => (
                <tr key={m.version}><td title={m.model}>{m.version}</td><td>{pct(m.test.accuracy)}</td><td>{pct(m.test.auto_route_rate)}</td>
                  <td>{pct(m.test.auto_routed_accuracy)}</td><td>{pct(m.test.oos_accepted_rate)}</td>
                  <td>{pct(m.test.other_intent_accepted_rate)}</td><td>{pct(m.test.mixed_auto_error_rate)}</td><td>{m.threshold}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Live requests by category</h2>
        {live.byCategory.length === 0 ? <p className="muted">No requests yet.</p> : live.byCategory.map((c) => (
          <div key={c.category} style={{ marginBottom: 8 }}>
            <div className="row spread small"><span>{label(c.category)}</span><span>{c.n}</span></div>
            <div className="meter"><span style={{ width: `${(c.n / live.total) * 100}%` }} /></div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default function Analytics() {
  return (
    <RequireRole roles={['agent', 'admin']}>
      <h1>Routing analytics</h1>
      <Dashboard />
    </RequireRole>
  );
}
