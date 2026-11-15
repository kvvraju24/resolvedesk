'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth, useToast } from './Providers';

const DEMOS = [
  ['Customer', 'alex@example.com'],
  ['Agent', 'maya@resolvedesk.dev'],
  ['Admin', 'admin@resolvedesk.dev'],
];

export default function LoginForm() {
  const { login, register, demo } = useAuth();
  const notify = useToast();
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const go = async (fn, email) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      notify('Signed in successfully.');
      router.push(email?.endsWith('@resolvedesk.dev') ? '/agent/inbox' : '/');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Enter your email and password.');
    go(mode === 'login' ? () => login(form.email, form.password) : () => register(form), form.email);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="card" style={{ maxWidth: 440, margin: '0 auto' }}>
      <h1>{mode === 'login' ? 'Sign in' : 'Create an account'}</h1>
      {error && <div className="alert error" role="alert">{error}</div>}
      <form onSubmit={submit} noValidate>
        {mode === 'register' && (
          <div className="field"><label htmlFor="name">Name</label><input id="name" autoComplete="name" value={form.name} onChange={set('name')} /></div>
        )}
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} /></div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} />
        </div>
        <div className="row spread" style={{ marginTop: 16 }}>
          <button className="btn primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          <button type="button" className="linkish" style={{ color: 'var(--brand)' }} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'New here? Create an account' : 'Have an account? Sign in'}
          </button>
        </div>
      </form>
      {demo && (
        <>
          <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '20px 0' }} />
          <p className="small muted">Try the demo (password <code>demo1234</code>):</p>
          <div className="row">
            {DEMOS.map(([role, email]) => (
              <button key={role} className="btn" disabled={busy} onClick={() => go(() => login(email, 'demo1234'), email)}>{role}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
