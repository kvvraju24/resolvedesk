'use client';
import Link from 'next/link';
import { useAuth } from './Providers';

export default function RequireRole({ roles, children }) {
  const { ready, user } = useAuth();
  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) {
    return (
      <div className="card empty">
        <h2>Please sign in</h2>
        <p className="muted">You need an account to view this page.</p>
        <Link className="btn primary" href="/login">Sign in</Link>
      </div>
    );
  }
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card empty">
        <h2>No access</h2>
        <p className="muted">Your account ({user.role}) does not have permission to view this page.</p>
        <Link className="btn" href="/">Go home</Link>
      </div>
    );
  }
  return children;
}
