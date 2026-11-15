'use client';

export default function Error({ reset }) {
  return (
    <div className="card empty">
      <h1>Something went wrong</h1>
      <p className="muted">An unexpected error occurred while loading this page.</p>
      <button className="btn primary" onClick={reset}>Try again</button>
    </div>
  );
}
