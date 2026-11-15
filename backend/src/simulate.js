// `npm run simulate` adds three weeks of realistic, backdated traffic so the
// model-health page has something to monitor. Run it after `npm run seed`.
//
// Requests are real held-out CLINC150 *test* texts, which the model never saw
// in training, and they go through the real API. For the first weeks the mix
// matches the validation data the threshold was tuned on (about 1/3
// unsupported). For the last `--drift-days` days, unsupported traffic jumps
// (default 65%), as if a new product launch sent unrelated questions to
// support. Simulated agents then review every request with its true label:
// they correct wrong categories and reject unsupported requests.
//
//   node src/simulate.js [--days 21] [--per-day 30] [--drift-days 8] [--drift-unsupported 0.65]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createApp } from './app.js';
import { ConfigError, loadConfig } from './config.js';
import { classify } from './classifier.js';
import { DEMO_PASSWORD } from './baseData.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'python', 'data', 'data_full.json');
const URL = 'https://raw.githubusercontent.com/clinc/oos-eval/master/data/data_full.json';
// None of these words is in the model's vocabulary, so the subject line does
// not change the prediction. This is checked below.
const SUBJECTS = ['Support question', 'Customer inquiry', 'Support case', 'Customer message', 'Question', 'Support issue'];
const BASE_UNSUPPORTED = 1 / 3;
const DAY_MS = 86_400_000;

const { values: opt } = parseArgs({
  options: {
    days: { type: 'string', default: '21' },
    'per-day': { type: 'string', default: '30' },
    'drift-days': { type: 'string', default: '8' },
    'drift-unsupported': { type: 'string', default: '0.65' },
    seed: { type: 'string', default: '7' },
  },
});
const DAYS = Number(opt.days);
const PER_DAY = Number(opt['per-day']);
const DRIFT_DAYS = Number(opt['drift-days']);
const DRIFT_UNSUPPORTED = Number(opt['drift-unsupported']);

// Small seeded RNG (mulberry32) so every run produces the same history.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function loadClinc() {
  if (fs.existsSync(DATA)) return JSON.parse(fs.readFileSync(DATA, 'utf8'));
  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    fs.mkdirSync(path.dirname(DATA), { recursive: true });
    fs.writeFileSync(DATA, text);
    return JSON.parse(text);
  } catch (e) {
    console.warn(`simulate: could not get CLINC150 (${e.message}); skipping simulated history.`);
    return null;
  }
}

// Seeding creates accounts with the published demo password, so it only runs in demo mode.
function demoConfigOrExit(script) {
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    if (!(e instanceof ConfigError)) throw e;
    console.error(e.message);
    process.exit(1);
  }
  if (!config.demoMode) {
    console.error(`${script} refused: it creates demo accounts with a published password and only runs with DEMO_MODE=true.`);
    process.exit(1);
  }
  return config;
}

async function main() {
  const config = demoConfigOrExit('npm run simulate');
  const raw = await loadClinc();
  if (!raw) return;
  const dbFile = process.env.DB_FILE || path.join(ROOT, 'data', 'resolvedesk.db');
  const { app, db, ctx } = createApp({ dbFile, config });
  const known = new Set(Object.keys(ctx.model.category_to_team));

  for (const s of SUBJECTS) {
    for (const w of s.toLowerCase().split(' ')) {
      if (ctx.model.index.has(w)) throw new Error(`subject word "${w}" is in the model vocabulary`);
    }
  }

  const ok = (t) => t.trim().length >= 10 && t.length <= 2000;
  const inscope = raw.test.filter(([t, l]) => known.has(l) && ok(t));
  const unsupported = [...raw.oos_test, ...raw.test.filter(([, l]) => !known.has(l))].filter(([t]) => ok(t));

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

  // Simulated customers, so the demo accounts' own request lists stay short.
  const customers = [];
  for (let i = 1; i <= 12; i++) {
    const email = `sim-customer-${i}@example.com`;
    const exists = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
    const r = exists
      ? await call('POST', '/auth/login', null, { email, password: DEMO_PASSWORD })
      : await call('POST', '/auth/register', null, { email, name: `Simulated customer ${i}`, password: DEMO_PASSWORD });
    customers.push(r.token);
  }
  const agent = (await call('POST', '/auth/login', null, { email: 'admin@resolvedesk.dev', password: DEMO_PASSWORD })).token;

  const rand = rng(Number(opt.seed));
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const now = Date.now();
  const stamp = (ms) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
  const backdate = db.prepare('UPDATE requests SET created_at = ?, updated_at = ? WHERE id = ?');
  const backdateRel = (table) => db.prepare(`UPDATE ${table} SET created_at = ? WHERE request_id = ?`);
  const related = ['predictions', 'assignments', 'corrections'].map(backdateRel);
  let total = 0;

  // Day DAYS ago ... yesterday; today is left for `npm run seed`'s live demo.
  for (let d = DAYS; d >= 1; d--) {
    const drifted = d <= DRIFT_DAYS;
    const share = drifted ? DRIFT_UNSUPPORTED : BASE_UNSUPPORTED;
    for (let i = 0; i < PER_DAY; i++) {
      const isUnsupported = rand() < share;
      const [text, label] = isUnsupported ? pick(unsupported) : pick(inscope);
      const subject = pick(SUBJECTS);
      if (total < 25) {
        const a = classify(ctx.model, `${subject}. ${text}`);
        const b = classify(ctx.model, text);
        if (a.category !== b.category || Math.abs(a.confidence - b.confidence) > 1e-9) throw new Error('subject changed a prediction');
      }
      const r = await call('POST', '/requests', pick(customers), { subject, body: text });

      // Simulated agent work, using the true label.
      if (isUnsupported) {
        await call('PATCH', `/requests/${r.id}/status`, agent, { status: 'rejected' });
      } else {
        if (r.status === 'needs_review' || r.category !== label) {
          await call('POST', `/requests/${r.id}/review`, agent, { category: label, note: 'simulated review' });
        }
        await call('PATCH', `/requests/${r.id}/status`, agent, { status: 'resolved' });
        await call('PATCH', `/requests/${r.id}/status`, agent, { status: 'closed' });
      }
      const at = now - d * DAY_MS + Math.floor(rand() * 8 * 3600_000) - 4 * 3600_000;
      backdate.run(stamp(at), stamp(at + 3600_000), r.id);
      for (const q of related) q.run(stamp(at), r.id);
      total++;
    }
  }
  server.close();
  console.log(`simulated ${total} requests over ${DAYS} days; unsupported share ${Math.round(BASE_UNSUPPORTED * 100)}% → ${Math.round(DRIFT_UNSUPPORTED * 100)}% for the last ${DRIFT_DAYS} days.`);
}

await main();
