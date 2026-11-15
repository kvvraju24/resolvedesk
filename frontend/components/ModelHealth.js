'use client';
import { useEffect, useState } from 'react';
import { pct } from './api';
import { useAuth } from './Providers';
import RequireRole from './RequireRole';

const H = 220, PAD = 36;

const STATUS = {
  stable: { text: 'Stable', cls: 'ok', note: 'Live traffic looks like the validation data the threshold was tuned on.' },
  watch: { text: 'Watch', cls: 'warn', note: 'Something is moving. Check the alerts below.' },
  drift: { text: 'Action needed', cls: 'err', note: 'The model is not behaving as it did on validation data.' },
  insufficient_data: { text: 'Not enough data', cls: 'info', note: 'Drift checks start once there are enough recent predictions.' },
};

// Daily line chart. `lines`: [{ key, color, dash, label }]; `refs`: horizontal guides.
function LineChart({ series, lines, refs = [], max = 1, fmt = (v) => `${Math.round(v * 100)}%`, label, W = 560 }) {
  const x = (i) => PAD + (i / Math.max(series.length - 1, 1)) * (W - PAD * 2);
  const y = (v) => H - PAD - (Math.min(v, max) / max) * (H - PAD * 2);
  const path = (key) => {
    let d = '', pen = false;
    series.forEach((p, i) => {
      if (p[key] == null) { pen = false; return; }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`;
      pen = true;
    });
    return d;
  };
  const ticks = [0, max / 2, max];
  const every = Math.ceil(series.length / 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ width: '100%', height: 'auto' }}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={PAD} x2={W - PAD} y1={y(v)} y2={y(v)} stroke="var(--border)" />
          <text x={PAD - 6} y={y(v) + 4} fontSize="11" textAnchor="end" fill="var(--muted)">{fmt(v)}</text>
        </g>
      ))}
      {series.map((p, i) => (i % every === 0 || i === series.length - 1) && (
        <text key={p.date} x={x(i)} y={H - PAD + 16} fontSize="11" textAnchor="middle" fill="var(--muted)">{p.date.slice(5)}</text>
      ))}
      {refs.map((r) => (
        <g key={r.label}>
          <line x1={PAD} x2={W - PAD} y1={y(r.y)} y2={y(r.y)} stroke={r.color} strokeDasharray="3 4" />
          <text x={W - PAD} y={y(r.y) - 5} fontSize="11" textAnchor="end" fill={r.color}>{r.label}</text>
        </g>
      ))}
      {lines.map((l) => (
        <path key={l.key} d={path(l.key)} fill="none" stroke={l.color} strokeWidth="2.5" strokeDasharray={l.dash} />
      ))}
    </svg>
  );
}

function Legend({ items }) {
  return (
    <div className="row small" style={{ gap: 20 }}>
      {items.map(([color, text, dash]) => (
        <span key={text}><span style={{ color }}>{dash ? '╍' : '━'}</span> {text}</span>
      ))}
    </div>
  );
}

// Live vs validation confidence histogram (grouped bars).
function Histogram({ bins, live, reference, W = 400 }) {
  const n = live.length, gw = (W - PAD * 2) / n, bw = gw * 0.34;
  const max = Math.max(...live, ...reference, 0.01);
  const y = (v) => H - PAD - (v / max) * (H - PAD * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Confidence distribution, live compared with validation" style={{ width: '100%', height: 'auto' }}>
      <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="var(--border)" />
      {live.map((v, i) => {
        const gx = PAD + i * gw + gw * 0.14;
        return (
          <g key={i}>
            <rect x={gx} y={y(reference[i])} width={bw} height={H - PAD - y(reference[i])} fill="var(--muted)" opacity="0.45" rx="2" />
            <rect x={gx + bw + 2} y={y(v)} width={bw} height={H - PAD - y(v)} fill="var(--brand)" rx="2" />
            <text x={gx + bw} y={Math.min(y(v), y(reference[i])) - 6} fontSize="11" textAnchor="middle" fill="var(--text)">{Math.round(v * 100)}%</text>
            <text x={gx + bw} y={H - PAD + 16} fontSize="11" textAnchor="middle" fill="var(--muted)">
              {bins[i].toFixed(1)}–{Math.min(bins[i + 1], 1).toFixed(1)}
            </text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 4} fontSize="11" textAnchor="middle" fill="var(--muted)">model confidence</text>
    </svg>
  );
}

function Health() {
  const { call } = useAuth();
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    call(`/monitoring?days=${days}`).then((d) => { setData(d); setError(''); }, (e) => setError(e.message));
  }, [call, days]);

  if (error) return <div className="alert error" role="alert">{error}</div>;
  if (!data) return <p className="muted">Loading model health…</p>;
  const c = data.current, ref = data.reference, s = STATUS[data.status];
  const series = data.series.map((p) => ({ ...p, expected: ref.review_share }));
  const psiMax = Math.max(0.4, ...series.map((p) => p.psi ?? 0));

  return (
    <div className="stack">
      <section className={`card health ${s.cls}`}>
        <div className="row spread">
          <div>
            <div className="small muted">Model {data.model_version} · threshold {data.threshold.toFixed(2)} · last {data.window_days} days</div>
            <h2 style={{ margin: '4px 0' }}>{s.text}</h2>
            <p className="small muted" style={{ margin: 0 }}>{s.note}</p>
          </div>
          <select aria-label="Time window" style={{ width: 'auto' }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={3}>Last 3 days</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
          </select>
        </div>
        {data.alerts.length > 0 && (
          <ul className="alerts">
            {data.alerts.map((a) => <li key={a.code} className={`alert ${a.level}`}>{a.message}</li>)}
          </ul>
        )}
      </section>

      <div className="grid">
        <div className="card"><div className="small muted">Confidence drift (PSI)</div><div className="stat">{c.psi == null ? '—' : c.psi.toFixed(2)}</div><div className="small muted">watch ≥ {data.rules.psi_watch} · act ≥ {data.rules.psi_drift}</div></div>
        <div className="card"><div className="small muted">Sent to human review</div><div className="stat">{pct(c.review_share)}</div><div className="small muted">{pct(ref.review_share)} expected from validation</div></div>
        <div className="card"><div className="small muted">Auto-routed and right (est.)</div><div className="stat">{pct(c.auto_precision_est)}</div><div className="small muted">target {pct(ref.target_precision, 0)} · {c.auto_n} auto-routed</div></div>
        <div className="card"><div className="small muted">Unsupported (after review)</div><div className="stat">{pct(c.unsupported_share)}</div><div className="small muted">{c.n} predictions · {c.corrections} corrections</div></div>
      </div>

      <section className="card">
        <h2>Confidence drift over time</h2>
        <p className="small muted">
          Population Stability Index between the model&apos;s confidence on live requests (trailing {data.window_days} days) and on validation data.
          It needs no labels, so it warns before agents have reviewed anything. Shown once a window has {data.rules.min_sample}+ predictions.
        </p>
        <LineChart series={series} max={psiMax} fmt={(v) => v.toFixed(2)} label="PSI by day"
          lines={[{ key: 'psi', color: 'var(--brand)' }]}
          refs={[{ y: data.rules.psi_watch, label: 'watch', color: 'var(--warn)' }, { y: data.rules.psi_drift, label: 'act', color: 'var(--err)' }]} />
      </section>

      <div className="two-col even">
        <section className="card">
          <h2>Review load and unsupported traffic</h2>
          <LineChart W={400} series={series} label="Share sent to review and share unsupported by day"
            lines={[{ key: 'review_share', color: 'var(--brand)' }, { key: 'unsupported_share', color: 'var(--err)', dash: '6 4' }, { key: 'expected', color: 'var(--muted)', dash: '2 4' }]} />
          <Legend items={[['var(--brand)', 'sent to review'], ['var(--err)', 'unsupported', true], ['var(--muted)', 'expected review', true]]} />
        </section>
        <section className="card">
          <h2>Confidence distribution</h2>
          <Histogram bins={data.bins} live={c.histogram} reference={ref.histogram} />
          <Legend items={[['var(--muted)', 'validation'], ['var(--brand)', `live, last ${data.window_days} days`]]} />
        </section>
      </div>

      <p className="small muted">
        &ldquo;Auto-routed and right&rdquo; counts an auto-routed request as wrong only when an agent later corrected or rejected it,
        so it is an upper bound if agents miss mistakes. Requests still waiting for review are left out.
      </p>
    </div>
  );
}

export default function ModelHealth() {
  return (
    <RequireRole roles={['agent', 'admin']}>
      <h1>Model health</h1>
      <Health />
    </RequireRole>
  );
}
