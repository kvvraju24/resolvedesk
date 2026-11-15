import Link from 'next/link';

export default function EmptyState({ title, text, href, action }) {
  return (
    <div className="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z" strokeLinejoin="round" />
      </svg>
      <h2>{title}</h2>
      {text && <p className="muted">{text}</p>}
      {href && <Link className="btn primary" href={href}>{action}</Link>}
    </div>
  );
}
