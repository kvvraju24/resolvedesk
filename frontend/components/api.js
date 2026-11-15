export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function api(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the ResolveDesk server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const label = (s) => (s ? s.replaceAll('_', ' ') : '—');
export const pct = (x, d = 1) => (x == null ? '—' : `${(x * 100).toFixed(d)}%`);
export const when = (s) => new Date(s.replace(' ', 'T') + (s.endsWith('Z') ? '' : 'Z')).toLocaleString();
