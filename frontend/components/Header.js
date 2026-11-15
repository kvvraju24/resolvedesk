'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from './Providers';

const LINKS = {
  guest: [['/', 'Get help'], ['/login', 'Sign in']],
  customer: [['/', 'New request'], ['/requests', 'My requests']],
  agent: [['/agent/inbox', 'Review inbox'], ['/agent/board', 'Assignment board'], ['/analytics', 'Analytics'], ['/monitoring', 'Model health']],
};
LINKS.admin = LINKS.agent;

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [path]);

  const links = LINKS[user?.role ?? 'guest'];
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand"><Image src="/logo.svg" alt="" width={28} height={28} /> ResolveDesk</Link>
        <button className="btn menu-btn" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'}
        </button>
        <nav id="main-nav" className={`nav ${open ? 'open' : ''}`} aria-label="Main">
          {links.map(([href, text]) => (
            <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{text}</Link>
          ))}
          {user && (
            <button className="linkish" onClick={() => { logout(); router.push('/login'); }}>
              Sign out <span className="muted small">({user.name.split(' ')[0]})</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
