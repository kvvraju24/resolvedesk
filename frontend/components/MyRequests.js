'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { label, when } from './api';
import EmptyState from './EmptyState';
import { useAuth } from './Providers';
import RequireRole from './RequireRole';
import StatusBadge from './StatusBadge';

function List() {
  const { call } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { call('/requests').then(setRows, (e) => setError(e.message)); }, [call]);

  if (error) return <div className="alert error" role="alert">{error}</div>;
  if (!rows) return <p className="muted">Loading your requests…</p>;
  if (!rows.length) return <EmptyState title="No requests yet" text="When you submit a request, you can follow its progress here." href="/" action="Submit a request" />;
  return (
    <ul className="list">
      {rows.map((r) => (
        <li key={r.id} className="list-item">
          <div>
            <Link className="title" href={`/requests/${r.id}`}>#{r.id} · {r.subject}</Link>
            <div className="small muted">{r.team_name ? `${r.team_name} · ${label(r.category)}` : 'Waiting for review'} · {when(r.created_at)}</div>
          </div>
          <StatusBadge status={r.status} />
        </li>
      ))}
    </ul>
  );
}

export default function MyRequests() {
  return (
    <RequireRole roles={['customer']}>
      <div className="row spread"><h1>My requests</h1><Link className="btn primary" href="/">New request</Link></div>
      <section className="card"><List /></section>
    </RequireRole>
  );
}
