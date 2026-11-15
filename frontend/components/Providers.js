'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

const AuthCtx = createContext(null);
const ToastCtx = createContext(() => {});
const KEY = 'resolvedesk.session';

export function Providers({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  // Whether the API runs in demo mode (shared accounts, published password). null = unknown.
  const [demo, setDemo] = useState(null);

  useEffect(() => {
    api('/health').then((h) => setDemo(h.demo === true), () => setDemo(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try { setSession(JSON.parse(localStorage.getItem(KEY))); } catch { /* storage unavailable */ }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const save = (s) => {
    setSession(s);
    try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch { /* ignore */ }
  };

  const notify = useCallback((message, kind = 'success') => {
    const id = Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const auth = useMemo(() => ({
    ready,
    demo,
    user: session?.user ?? null,
    token: session?.token ?? null,
    login: async (email, password) => save(await api('/auth/login', { method: 'POST', body: { email, password } })),
    register: async (body) => save(await api('/auth/register', { method: 'POST', body })),
    logout: () => save(null),
    call: (path, opts = {}) => api(path, { ...opts, token: session?.token }).catch((e) => {
      if (e.status === 401) save(null);
      throw e;
    }),
  }), [session, ready, demo]);

  return (
    <AuthCtx.Provider value={auth}>
      <ToastCtx.Provider value={notify}>
        {children}
        <div className="toasts" role="status" aria-live="polite">
          {toasts.map((t) => <div key={t.id} className={`alert toast ${t.kind}`}>{t.message}</div>)}
        </div>
      </ToastCtx.Provider>
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export const useToast = () => useContext(ToastCtx);
