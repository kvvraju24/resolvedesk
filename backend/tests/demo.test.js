import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { DEMO_PASSWORD } from '../src/baseData.js';
import { BootstrapError, createFirstAdmin } from '../src/bootstrapAdmin.js';
import { loadConfig } from '../src/config.js';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

async function withServer(config, fn) {
  const made = createApp({ dbFile: ':memory:', config });
  const server = made.app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api`;
  try {
    return await fn(base, made);
  } finally {
    server.close();
  }
}
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

describe('demo mode', () => {
  test('defaults: on in development and test, off in production', () => {
    assert.equal(loadConfig({ NODE_ENV: 'development' }).demoMode, true);
    assert.equal(loadConfig({ NODE_ENV: 'test' }).demoMode, true);
    const prod = { JWT_SECRET: 'x'.repeat(48), CORS_ORIGIN: 'https://a.example' };
    assert.equal(loadConfig(prod).demoMode, false);
    const optedIn = loadConfig({ ...prod, DEMO_MODE: 'true' });
    assert.equal(optedIn.demoMode, true);
    assert.match(optedIn.warnings[0], /published password/);
    assert.throws(() => loadConfig({ NODE_ENV: 'test', DEMO_MODE: 'yes' }), /DEMO_MODE must be/);
  });

  test('without demo mode: no accounts exist, demo admin cannot sign in, health says demo false', async () => {
    await withServer(loadConfig({ NODE_ENV: 'test', DEMO_MODE: 'false' }), async (base, { db }) => {
      assert.equal(db.prepare('SELECT COUNT(*) AS n FROM users').get().n, 0);
      assert.ok(db.prepare('SELECT COUNT(*) AS n FROM teams').get().n > 0, 'teams are still created');
      const r = await post(`${base}/auth/login`, { email: 'admin@resolvedesk.dev', password: DEMO_PASSWORD });
      assert.equal(r.status, 401);
      assert.equal((await (await fetch(`${base}/health`)).json()).demo, false);
    });
  });

  test('with demo mode: demo accounts work and health says demo true', async () => {
    await withServer(loadConfig({ NODE_ENV: 'test', DEMO_MODE: 'true' }), async (base) => {
      const r = await post(`${base}/auth/login`, { email: 'admin@resolvedesk.dev', password: DEMO_PASSWORD });
      assert.equal(r.status, 200);
      assert.equal((await (await fetch(`${base}/health`)).json()).demo, true);
    });
  });
});

describe('bootstrap admin', () => {
  const fresh = () => createApp({ dbFile: ':memory:', config: loadConfig({ NODE_ENV: 'test', DEMO_MODE: 'false' }) });

  test('creates the first administrator, who can sign in', async () => {
    const made = fresh();
    const admin = createFirstAdmin(made.db, { email: ' Owner@Example.com ', password: 'a-long-password', name: 'Owner' });
    assert.deepEqual({ email: admin.email, role: admin.role }, { email: 'owner@example.com', role: 'admin' });
    const server = made.app.listen(0);
    try {
      const r = await post(`http://127.0.0.1:${server.address().port}/api/auth/login`, { email: 'owner@example.com', password: 'a-long-password' });
      assert.equal(r.status, 200);
    } finally {
      server.close();
    }
  });

  test('refuses a second administrator, short passwords and bad emails', () => {
    const { db } = fresh();
    assert.throws(() => createFirstAdmin(db, { email: 'a@example.com', password: 'short' }), BootstrapError);
    assert.throws(() => createFirstAdmin(db, { email: 'not-an-email', password: 'a-long-password' }), BootstrapError);
    createFirstAdmin(db, { email: 'a@example.com', password: 'a-long-password' });
    assert.throws(() => createFirstAdmin(db, { email: 'b@example.com', password: 'a-long-password' }), /already exists/);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n, 1);
  });

  test('refuses when demo accounts already include an administrator', () => {
    const { db } = createApp({ dbFile: ':memory:', config: loadConfig({ NODE_ENV: 'test' }) });
    assert.throws(() => createFirstAdmin(db, { email: 'new@example.com', password: 'a-long-password' }), /already exists/);
  });
});

describe('seeding outside demo mode', () => {
  test('seed refuses and does not delete the database', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'resolvedesk-'));
    const dbFile = path.join(dir, 'keep.db');
    fs.writeFileSync(dbFile, 'existing data');
    try {
      const env = { PATH: process.env.PATH, NODE_ENV: 'development', DEMO_MODE: 'false', DB_FILE: dbFile };
      const r = spawnSync(process.execPath, [path.join(SRC, 'seed.js')], { env, encoding: 'utf8', timeout: 10_000 });
      assert.equal(r.status, 1, r.stdout + r.stderr);
      assert.match(r.stderr, /only runs with DEMO_MODE=true/);
      assert.equal(fs.readFileSync(dbFile, 'utf8'), 'existing data');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
