import SubmitForm from '@/components/SubmitForm';

export const metadata = {
  title: { absolute: 'ResolveDesk — Get help from the right team, fast' },
  description: 'Describe your banking, card, travel, car or billing issue. ResolveDesk classifies it and routes it to the right support team.',
};

export default function Home() {
  return (
    <div className="two-col">
      <section className="card">
        <h1>How can we help?</h1>
        <p className="muted">Describe your issue in your own words. We route it to the right team automatically, and a person double-checks anything we are unsure about.</p>
        <SubmitForm />
      </section>
      <aside className="card stack">
        <h2>What we support</h2>
        <ul className="small">
          <li><strong>Banking</strong> — transfers, balances, freezing an account, fraud</li>
          <li><strong>Cards</strong> — declined or lost cards, replacements, credit limits</li>
          <li><strong>Travel</strong> — flights, lost luggage, travel alerts, visas</li>
          <li><strong>Auto Care</strong> — maintenance, oil, tire pressure, jump starts</li>
          <li><strong>Billing</strong> — paying bills, due dates, spending, checks</li>
        </ul>
        <p className="small muted">Requests outside these areas are reviewed by an agent and may be declined.</p>
      </aside>
    </div>
  );
}
