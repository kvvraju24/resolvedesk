// Base data (teams, staff accounts, active model version), created on start if missing.
import { hashPassword } from './auth.js';

export const DEMO_PASSWORD = 'demo1234';

const TEAMS = [
  ['banking', 'Banking'], ['cards', 'Cards'], ['travel', 'Travel'], ['auto', 'Auto Care'], ['billing', 'Billing'],
];

const STAFF = [
  ['admin@resolvedesk.dev', 'Priya Admin', 'admin', null],
  ['maya@resolvedesk.dev', 'Maya Chen', 'agent', 'banking'],
  ['omar@resolvedesk.dev', 'Omar Haddad', 'agent', 'banking'],
  ['lena@resolvedesk.dev', 'Lena Fischer', 'agent', 'cards'],
  ['raj@resolvedesk.dev', 'Raj Patel', 'agent', 'travel'],
  ['sofia@resolvedesk.dev', 'Sofia Rossi', 'agent', 'auto'],
  ['kwame@resolvedesk.dev', 'Kwame Mensah', 'agent', 'billing'],
];

export const CUSTOMERS = [
  ['alex@example.com', 'Alex Morgan'],
  ['jordan@example.com', 'Jordan Lee'],
  ['sam@example.com', 'Sam Rivera'],
];

export function ensureBaseData(db, model) {
  const insTeam = db.prepare('INSERT OR IGNORE INTO teams (slug, name) VALUES (?, ?)');
  for (const [slug, name] of TEAMS) insTeam.run(slug, name);
  const teamId = (slug) => db.prepare('SELECT id FROM teams WHERE slug = ?').get(slug)?.id ?? null;
  const insUser = db.prepare('INSERT OR IGNORE INTO users (email, name, password_hash, role, team_id) VALUES (?, ?, ?, ?, ?)');
  if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) {
    const hash = hashPassword(DEMO_PASSWORD);
    for (const [email, name, role, team] of STAFF) insUser.run(email, name, hash, role, team && teamId(team));
    for (const [email, name] of CUSTOMERS) insUser.run(email, name, hash, 'customer', null);
  }
  if (!db.prepare('SELECT 1 FROM model_versions WHERE version = ?').get(model.version)) {
    db.prepare('UPDATE model_versions SET is_active = 0').run();
    db.prepare('INSERT INTO model_versions (version, description, threshold, metrics_json, is_active) VALUES (?, ?, ?, ?, 1)')
      .run(model.version, model.metrics?.model ?? model.type, model.threshold, JSON.stringify(model.metrics?.test ?? {}));
  }
}

