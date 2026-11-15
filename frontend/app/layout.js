import './globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Providers } from '@/components/Providers';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'ResolveDesk — Smart support request routing', template: '%s · ResolveDesk' },
  description: 'Submit a support request and ResolveDesk routes it to the right team automatically, with human review for uncertain cases.',
  openGraph: { type: 'website', siteName: 'ResolveDesk' },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#2f5bea' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <a href="#main" className="visually-hidden">Skip to content</a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
