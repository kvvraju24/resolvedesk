'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { label, pct, when } from './api';
import { useAuth, useToast } from './Providers';
import RequireRole from './RequireRole';
import StatusBadge from './StatusBadge';

// Mirrors backend/src/routing.js TRANSITIONS.
const NEXT = {
  staff: {
    needs_review: ['rejected'], open: ['in_progress', 'resolved', 'rejected'], in_progress: ['open', 'resolved'],
    resolved: ['in_progress', 'closed'], closed: [], rejected: ['needs_review'],
  },
  customer: { resolved: ['closed', 'open'] },
};
const ACTION = { in_progress: 'Start work', resolved: 'Mark resolved', closed: 'Close', open: 'Reopen', rejected: 'Reject as unsupported', needs_review: 'Send back to review' };

function Prediction({ req, teams, onReview }) {
  const p = req.prediction;
  const [category, setCategory] = useState(req.category ?? p?.category ?? '');
  const [note, setNote] = useState('');
  if (!p) return null;
  const confident = p.confidence >= p.threshold;
  return (
    <section className="card stack">
      <h2>Model prediction</h2>
      <div>
        <div className="row spread"><strong>{label(p.category)}</strong><span>{pct(p.confidence)}</span></div>
        <div className="meter" aria-hidden="true"><span style={{ width: pct(p.confidence) }} /></div>
        <p className="small muted" style={{ marginTop: 6 }}>
          Threshold {pct(p.threshold, 0)} → {confident ? 'routed automatically' : 'sent to human review'} · {p.model_version}
        </p>
      </div>
      {p.alternatives?.length > 0 && (
        <div className="small">
          <span className="muted">Other candidates: </span>
          {p.alternatives.map((a) => `${label(a.category)} (${pct(a.confidence)})`).join(', ')}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); onReview(category, note); }}>
        <div className="field">
          <label htmlFor="category">{req.category ? 'Correct category' : 'Confirm or correct category'}</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {teams.map((t) => (
              <optgroup key={t.slug} label={t.name}>
                {t.categories.map((c) => <option key={c} value={c}>{label(c)}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="note">Note (optional)</label>
          <input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this category?" />
        </div>
        <button className="btn primary" style={{ marginTop: 12 }}>
          {category === (req.category ?? p.category) ? 'Confirm & route' : 'Save correction & route'}
        </button>
      </form>
      {req.corrections?.length > 0 && (
        <ul className="small muted">
          {req.corrections.map((c) => (
            <li key={c.id}>{c.agent_name}: {label(c.predicted_category)} → {label(c.new_category)}{c.note ? ` — “${c.note}”` : ''}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Detail({ id }) {
  const { user, call } = useAuth();
  const notify = useToast();
  const staff = user.role !== 'customer';
  const [req, setReq] = useState(null);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [msg, setMsg] = useState('');
  const [internal, setInternal] = useState(false);

  const load = useCallback(() => call(`/requests/${id}`).then(setReq, (e) => setError(e.message)), [call, id]);
  useEffect(() => {
    load();
    if (staff) {
      call('/teams').then(setTeams).catch(() => {});
      call('/agents').then(setAgents).catch(() => {});
    }
  }, [load, call, staff]);

  const act = async (path, body, method = 'POST', ok = 'Saved.') => {
    try {
      await call(path, { method, body });
      notify(ok);
      await load();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  if (error) {
    return (
      <div className="card empty">
        <h1>Request not found</h1>
        <p className="muted">{error}</p>
        <Link className="btn" href={staff ? '/agent/board' : '/requests'}>Back</Link>
      </div>
    );
  }
  if (!req) return <p className="muted">Loading request…</p>;

  const transitions = (staff ? NEXT.staff : NEXT.customer)[req.status] ?? [];
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return notify('Write a message first.', 'error');
    await act(`/requests/${req.id}/messages`, { body: msg, internal }, 'POST', internal ? 'Internal note added.' : 'Message sent.');
    setMsg('');
  };

  return (
    <div className="stack">
      <Link href={staff ? '/agent/board' : '/requests'} className="small">← Back</Link>
      <div className="row spread">
        <h1 style={{ overflowWrap: 'anywhere' }}>#{req.id} · {req.subject}</h1>
        <StatusBadge status={req.status} />
      </div>
      <div className="two-col">
        <div className="stack">
          <section className="card">
            <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{req.body}</p>
            <p className="small muted">
              {staff && <>From {req.customer_name} · </>}Submitted {when(req.created_at)} ·{' '}
              {req.team_name ? <>Team <strong>{req.team_name}</strong> ({label(req.category)})</> : 'Awaiting review'}
              {req.assignment?.agent_name && <> · Agent {req.assignment.agent_name}</>}
            </p>
            {transitions.length > 0 && (
              <div className="row">
                {transitions.map((s) => (
                  <button key={s} className={`btn ${s === 'rejected' ? 'danger' : ''}`}
                    onClick={() => act(`/requests/${req.id}/status`, { status: s }, 'PATCH', `Status changed to ${label(s)}.`)}>
                    {ACTION[s]}
                  </button>
                ))}
              </div>
            )}
          </section>
          <section className="card stack">
            <h2>Conversation</h2>
            {req.messages.length === 0 && <p className="muted small">No messages yet.</p>}
            {req.messages.map((m) => (
              <div key={m.id} className={`bubble ${m.internal ? 'internal' : ''}`}>
                <div className="small muted">{m.author_name}{m.author_role !== 'customer' && ' (support)'}{m.internal ? ' · internal note' : ''} · {when(m.created_at)}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
              </div>
            ))}
            {!['closed', 'rejected'].includes(req.status) && (
              <form onSubmit={sendMessage}>
                <label htmlFor="msg" className="visually-hidden">Message</label>
                <textarea id="msg" value={msg} maxLength={2000} onChange={(e) => setMsg(e.target.value)} placeholder={staff ? 'Reply to the customer or add a note' : 'Add more details for the support team'} />
                <div className="row spread" style={{ marginTop: 8 }}>
                  {staff ? (
                    <label className="row small" style={{ fontWeight: 400, margin: 0 }}>
                      <input type="checkbox" style={{ width: 'auto' }} checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note
                    </label>
                  ) : <span />}
                  <button className="btn primary">Send</button>
                </div>
              </form>
            )}
          </section>
        </div>
        {staff && (
          <div className="stack">
            {teams.length > 0 && (
              <Prediction key={`${req.id}-${req.category}`} req={req} teams={teams}
                onReview={(category, note) => act(`/requests/${req.id}/review`, { category, note }, 'POST', 'Category saved and request routed.')} />
            )}
            {req.category && agents.length > 0 && (
              <section className="card">
                <h2>Assign agent</h2>
                <label htmlFor="agent" className="visually-hidden">Agent</label>
                <select id="agent" value={req.assignment?.agent_id ?? ''}
                  onChange={(e) => act(`/requests/${req.id}/assign`, { agentId: Number(e.target.value) }, 'POST', 'Agent assigned.')}>
                  <option value="" disabled>Choose an agent</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.team_name} ({a.load} active)</option>)}
                </select>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RequestDetail({ id }) {
  return <RequireRole><Detail id={id} /></RequireRole>;
}
