'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { label, pct, when } from './api';
import EmptyState from './EmptyState';
import { useAuth } from './Providers';
import RequireRole from './RequireRole';
import StatusBadge from './StatusBadge';

function Queue({ title, query, empty }) {
  const { call } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { call(`/requests?${query}`).then(setRows, (e) => setError(e.message)); }, [call, query]);
  return (
    <section className="card">
      <h2>{title} {rows && <span className="badge">{rows.length}</span>}</h2>
      {error && <div className="alert error" role="alert">{error}</div>}
      {!rows && !error && <p className="muted">Loading…</p>}
      {rows?.length === 0 && <EmptyState title={empty} />}
      <ul className="list">
        {rows?.map((r) => (
          <li key={r.id} className="list-item">
            <div>
              <Link className="title" href={`/requests/${r.id}`}>#{r.id} · {r.subject}</Link>
              <div className="small muted">
                {r.customer_name} · {when(r.created_at)} · model guess: {label(r.predicted_category)} ({pct(r.confidence, 0)})
              </div>
            </div>
            <StatusBadge status={r.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Inbox() {
  return (
    <RequireRole roles={['agent', 'admin']}>
      <h1>Review inbox</h1>
      <p className="muted">Requests below the confidence threshold wait here until an agent confirms or corrects the category.</p>
      <div className="stack">
        <Queue title="Needs review" query="status=needs_review" empty="Nothing to review — every request has been routed." />
        <Queue title="Assigned to me" query="mine=1&status=open" empty="No open requests are assigned to you." />
      </div>
    </RequireRole>
  );
}
