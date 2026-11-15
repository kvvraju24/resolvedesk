const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
const phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE;

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} ResolveDesk · Support routing built on CLINC150</span>
        <span className="row">
          {email && <a href={`mailto:${email}`}>{email}</a>}
          {phone && <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>}
          <a href="https://github.com/clinc/oos-eval" rel="noopener noreferrer" target="_blank">Dataset</a>
        </span>
      </div>
    </footer>
  );
}
