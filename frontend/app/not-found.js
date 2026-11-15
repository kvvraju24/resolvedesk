import Link from 'next/link';

export const metadata = { title: 'Page not found', description: 'The page you were looking for does not exist.' };

export default function NotFound() {
  return (
    <div className="card empty">
      <p className="stat">404</p>
      <h1>We couldn’t find that page</h1>
      <p className="muted">The link may be broken or the page may have moved.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <Link className="btn primary" href="/">Go home</Link>
        <Link className="btn" href="/requests">My requests</Link>
      </div>
    </div>
  );
}
