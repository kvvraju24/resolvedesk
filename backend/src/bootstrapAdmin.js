// `npm run bootstrap-admin` creates the first administrator of a non-demo deployment.
//
// Credentials come from BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD (and optional
// BOOTSTRAP_ADMIN_NAME), or are asked for interactively with the password hidden.
// It refuses to run if any administrator already exists, so it cannot be used to
// take over an existing installation. Remove the variables after use.
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { hashPassword } from './auth.js';

export const MIN_ADMIN_PASSWORD = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class BootstrapError extends Error {}

export function createFirstAdmin(db, { email, password, name = 'Administrator' }) {
  const normalized = String(email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(normalized)) throw new BootstrapError('Enter a valid email address.');
  if (String(password ?? '').length < MIN_ADMIN_PASSWORD) {
    throw new BootstrapError(`The password must be at least ${MIN_ADMIN_PASSWORD} characters.`);
  }
  if (db.prepare("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1").get()) {
    throw new BootstrapError('An administrator already exists. Nothing was changed.');
  }
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(normalized)) {
    throw new BootstrapError('An account with this email already exists. Nothing was changed.');
  }
  const { lastInsertRowid } = db.prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'admin')")
    .run(normalized, String(name).trim() || 'Administrator', hashPassword(password));
  return db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(lastInsertRowid);
}

async function prompt(rl, question, { hidden = false } = {}) {
  if (!hidden) return rl.question(question);
  process.stdout.write(question);
  const original = rl._writeToOutput;
  rl._writeToOutput = () => {}; // do not echo the password
  try {
    return await rl.question('');
  } finally {
    rl._writeToOutput = original;
    process.stdout.write('\n');
  }
}

async function main() {
  const { ConfigError, loadConfig } = await import('./config.js');
  const { createApp } = await import('./app.js');
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    if (!(e instanceof ConfigError)) throw e;
    console.error(e.message);
    process.exit(1);
  }

  let { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_PASSWORD: password, BOOTSTRAP_ADMIN_NAME: name } = process.env;
  if (!email || !password) {
    if (!process.stdin.isTTY) {
      console.error('Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD, or run this in a terminal to be asked.');
      process.exit(1);
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      email ||= await prompt(rl, 'Administrator email: ');
      name ||= await prompt(rl, 'Name (Administrator): ');
      password ||= await prompt(rl, `Password (at least ${MIN_ADMIN_PASSWORD} characters): `, { hidden: true });
    } finally {
      rl.close();
    }
  }

  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const { db } = createApp({ dbFile: process.env.DB_FILE || path.join(root, 'data', 'resolvedesk.db'), config });
  try {
    const admin = createFirstAdmin(db, { email, password, name: name || undefined });
    console.log(`Created administrator ${admin.email}. Sign in, then remove any BOOTSTRAP_ADMIN_* variables.`);
  } catch (e) {
    if (!(e instanceof BootstrapError)) throw e;
    console.error(e.message);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
