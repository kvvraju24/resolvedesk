'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth, useToast } from './Providers';

export default function SubmitForm() {
  const { user, call } = useAuth();
  const notify = useToast();
  const [form, setForm] = useState({ subject: '', body: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);

  if (!user) {
    return (
      <div className="alert info">
        <Link href="/login">Sign in or create an account</Link> to submit a request and follow its status.
      </div>
    );
  }
  if (user.role !== 'customer') {
    return <div className="alert info">You are signed in as staff. Head to the <Link href="/agent/inbox">review inbox</Link>.</div>;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.subject.trim().length < 3) return setError('Add a short subject (at least 3 characters).');
    if (form.body.trim().length < 10) return setError('Please describe your issue in at least 10 characters.');
    setBusy(true);
    try {
      const r = await call('/requests', { method: 'POST', body: form });
      setCreated(r);
      setForm({ subject: '', body: '' });
      notify('Request submitted — we have it.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      {created && (
        <div className="alert success">
          Request #{created.id} received.{' '}
          {created.routing === 'auto'
            ? <>It was routed to <strong>{created.team_name}</strong>.</>
            : <>An agent will review it shortly to find the right team.</>}{' '}
          <Link href={`/requests/${created.id}`}>View status</Link>
        </div>
      )}
      {error && <div className="alert error" role="alert">{error}</div>}
      <div className="field">
        <label htmlFor="subject">Subject</label>
        <input id="subject" maxLength={140} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Card declined at checkout" />
      </div>
      <div className="field">
        <label htmlFor="body">What happened?</label>
        <textarea id="body" maxLength={2000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Tell us what you need help with" />
        <p className="small muted">{form.body.length}/2000</p>
      </div>
      <button className="btn primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button>
    </form>
  );
}
