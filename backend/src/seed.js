// `npm run seed` wipes the DB and replays a demo workload through the real API.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { CUSTOMERS, DEMO_PASSWORD } from './baseData.js';

// [customer, subject, body] — mix of clear, ambiguous and unsupported requests.
const DEMO_REQUESTS = [
  [0, 'Money transfer', 'Please transfer 200 dollars from my checking to my savings account'],
  [0, 'Card got declined', 'My card was declined at the grocery store this morning, why?'],
  [1, 'Lost my card', 'I think I lost my credit card on the train, please help me report it'],
  [1, 'Flight booking', 'I need to book a flight from Boston to Chicago next Friday'],
  [2, 'Luggage missing', 'The airline lost my luggage on my way back from Rome'],
  [2, 'Tire pressure', 'What should the tire pressure be on my car? The light is on'],
  [0, 'Oil change', 'How do I change the oil in my car myself?'],
  [1, 'Pay electricity bill', 'I want to pay my electric bill today'],
  [2, 'Bill due date', 'When is my water bill due this month?'],
  [0, 'Freeze account', 'Someone may have my password, freeze my account right now'],
  [1, 'Fraud on statement', 'There are charges on my account I did not make, I want to report fraud'],
  [2, 'Visa question', 'Do I need a visa to travel to Japan with a US passport?'],
  [0, 'Replacement card', 'How long does it take to get a replacement card after ordering one?'],
  [1, 'Credit limit', 'Can you raise the credit limit on my card to 5000?'],
  [2, 'Car wont start', 'My car battery is dead and it will not start, how do I jump it?'],
  [0, 'Spending', 'How much did I spend on restaurants last month?'],
  [1, 'Checks', 'I need to order a new book of checks'],
  [2, 'Travel notice', 'Are there any travel alerts for Mexico right now?'],
  [0, 'Service appointment', 'I would like to schedule a maintenance appointment for my car'],
  [1, 'Balance', 'What is the current balance in my savings account?'],
  [2, 'Help with account', 'Something is wrong with my account and the money is not where it should be'],
  [0, 'Question', 'My card and my bill are both confusing me, can someone call me back'],
  [1, 'Recipe', 'Can you give me a good recipe for lasagna?'],
  [2, 'Weather', 'What is the weather going to be like tomorrow in Seattle?'],
  [0, 'Music', 'Play some jazz music for me please'],
  [1, 'Trip issue', 'Problem with my trip payment and the booking changed'],
];

async function runDemo() {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const dbFile = process.env.DB_FILE || path.join(root, 'data', 'resolvedesk.db');
  for (const f of [dbFile, `${dbFile}-wal`, `${dbFile}-shm`]) fs.rmSync(f, { force: true });
  const { app, db } = createApp({ dbFile });
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const call = async (method, url, token, body) => {
    const res = await fetch(base + url, {
      method, headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
      body: body && JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`${method} ${url}: ${data.error}`);
    return data;
  };
  const login = async (email) => (await call('POST', '/auth/login', null, { email, password: DEMO_PASSWORD })).token;

  const customers = await Promise.all(CUSTOMERS.map(([e]) => login(e)));
  const created = [];
  for (const [c, subject, body] of DEMO_REQUESTS) created.push(await call('POST', '/requests', customers[c], { subject, body }));

  // Agents work part of the queue: review uncertain ones, progress some auto-routed ones.
  const admin = await login('admin@resolvedesk.dev');
  const agentToken = {};
  const tokenFor = async (id) => {
    const email = db.prepare('SELECT email FROM users WHERE id = ?').get(id).email;
    return (agentToken[email] ??= await login(email));
  };
  const reviews = {
    'Help with account': 'balance', 'Question': 'card_declined', 'Trip issue': 'book_flight',
    'Recipe': null, 'Weather': null, 'Music': null,
  };
  for (const r of created) {
    if (r.subject in reviews) {
      if (reviews[r.subject] === null) {
        // Unsupported request (auto-routed by mistake or sent to review): agent rejects it.
        await call('PATCH', `/requests/${r.id}/status`, admin, { status: 'rejected' });
      } else {
        await call('POST', `/requests/${r.id}/review`, admin, { category: reviews[r.subject], note: 'Checked with customer' });
      }
      continue;
    }
    if (r.status === 'open' && r.id % 3 === 0) {
      const t = await tokenFor(r.assignment.agent_id);
      await call('PATCH', `/requests/${r.id}/status`, t, { status: 'in_progress' });
      await call('POST', `/requests/${r.id}/messages`, t, { body: 'Thanks for reaching out — I am looking into this now.' });
      if (r.id % 2 === 0) {
        await call('POST', `/requests/${r.id}/messages`, t, { body: 'All sorted. Let us know if anything else comes up.' });
        await call('PATCH', `/requests/${r.id}/status`, t, { status: 'resolved' });
      }
    }
  }
  // Leave two fresh uncertain requests in the review inbox.
  const [alex] = customers;
  await call('POST', '/requests', alex, { subject: 'Not sure', body: 'I have a problem with something I paid for, not sure who to ask' });
  await call('POST', '/requests', alex, { subject: 'Account thing', body: 'Need help with my account settings and a charge' });

  const n = db.prepare("SELECT COUNT(*) AS n, SUM(routing='auto') AS auto, SUM(status='needs_review') AS review FROM requests").get();
  console.log(`seeded ${n.n} requests (${n.auto} auto-routed, ${n.review} awaiting review). Demo password: ${DEMO_PASSWORD}`);
  server.close();
}

await runDemo();
