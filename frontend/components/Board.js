'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { label } from './api';
import EmptyState from './EmptyState';
import { useAuth } from './Providers';
import RequireRole from './RequireRole';
import StatusBadge from './StatusBadge';

const ACTIVE = ['needs_review', 'open', 'in_progress'];

function Columns() {
  const { call } = useAuth();
  const [rows, setRows] = useState(null);
  const [teams, setTeams] = useState([]);
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([call('/requests'), call('/teams')]).then(([r, t]) => { setRows(r); setTeams(t); }, (e) => setError(e.message));
  }, [call]);

  if (error) return <div className="alert error" role="alert">{error}</div>;
  if (!rows) return <p className="muted">Loading board…</p>;
  const shown = rows.filter((r) => (status === 'active' ? ACTIVE.includes(r.status) : r.status === status));
  const cols = [{ slug: null, name: 'Unassigned (review)' }, ...teams];

  return (
    <>
      <div className="row" style={{ marginBottom: 16 }}>
        <label htmlFor="status" style={{ margin: 0 }}>Show</label>
        <select id="status" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          {['resolved', 'closed', 'rejected'].map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <span className="small muted">{shown.length} requests</span>
      </div>
      {shown.length === 0 ? (
        <div className="card"><EmptyState title="No requests here" text="Try a different filter." /></div>
      ) : (
        <div className="board">
          {cols.map((c) => {
            const items = shown.filter((r) => (r.team_slug ?? null) === c.slug);
            return (
              <section key={c.name} className="board-col" aria-label={c.name}>
                <div className="row spread"><strong>{c.name}</strong><span className="badge">{items.length}</span></div>
                {items.length === 0 && <p className="small muted" style={{ marginTop: 10 }}>No requests.</p>}
                {items.map((r) => (
                  <article key={r.id} className="board-card">
                    <Link className="title" href={`/requests/${r.id}`} style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>#{r.id} {r.subject}</Link>
                    <div className="row spread small" style={{ marginTop: 6 }}>
                      <span className="muted">{r.agent_name ?? 'No agent'} · {r.routing}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function Board() {
  return (
    <RequireRole roles={['agent', 'admin']}>
      <h1>Assignment board</h1>
      <p className="muted">Requests grouped by the team they are routed to.</p>
      <Columns />
    </RequireRole>
  );
}
