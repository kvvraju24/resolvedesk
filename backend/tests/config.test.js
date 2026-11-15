import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { ConfigError, DEV_ONLY_SECRET, loadConfig } from '../src/config.js';

const SECRET = 'x'.repeat(48);
const SERVER = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'server.js');

const problemsOf = (env) => {
  try {
    loadConfig(env);
    return [];
  } catch (e) {
    assert.ok(e instanceof ConfigError);
    return e.problems;
  }
};

describe('loadConfig', () => {
  test('unset NODE_ENV counts as production and requires secret and CORS', () => {
    const problems = problemsOf({});
    assert.equal(problems.length, 2);
    assert.match(problems[0], /JWT_SECRET is required/);
    assert.match(problems[1], /CORS_ORIGIN is required/);
  });

  test('production rejects short and published secrets', () => {
    assert.match(problemsOf({ NODE_ENV: 'production', JWT_SECRET: 'short', CORS_ORIGIN: 'https://a.example' })[0], /too short/);
    assert.match(problemsOf({ JWT_SECRET: DEV_ONLY_SECRET, CORS_ORIGIN: 'https://a.example' })[0], /published development secret/);
  });

  test('production rejects CORS entries that are not plain origins', () => {
    const problems = problemsOf({ JWT_SECRET: SECRET, CORS_ORIGIN: 'https://a.example/app, not-a-url' });
    assert.equal(problems.length, 2);
    assert.match(problems[0], /origin only/);
    assert.match(problems[1], /not a URL/);
  });

  test('valid production config', () => {
    const c = loadConfig({ JWT_SECRET: SECRET, CORS_ORIGIN: 'https://a.example, https://b.example:8443/' });
    assert.equal(c.production, true);
    assert.equal(c.jwtSecret, SECRET);
    assert.deepEqual(c.corsOrigins, ['https://a.example', 'https://b.example:8443']);
  });

  test('development needs no configuration and says so', () => {
    const c = loadConfig({ NODE_ENV: 'development' });
    assert.equal(c.production, false);
    assert.equal(c.jwtSecret, DEV_ONLY_SECRET);
    assert.equal(c.corsOrigins, true);
    assert.match(c.warnings[0], /development secret/);
  });
});

describe('HTTP hardening', () => {
  async function headersFor(config, origin) {
    const { app } = createApp({ dbFile: ':memory:', config });
    const server = app.listen(0);
    try {
      const res = await fetch(`http://127.0.0.1:${server.address().port}/api/health`, { headers: origin ? { origin } : {} });
      return res.headers;
    } finally {
      server.close();
    }
  }

  test('security headers on every response; no X-Powered-By; no HSTS outside production', async () => {
    const h = await headersFor(loadConfig({ NODE_ENV: 'test' }));
    assert.equal(h.get('x-content-type-options'), 'nosniff');
    assert.equal(h.get('x-frame-options'), 'DENY');
    assert.equal(h.get('referrer-policy'), 'no-referrer');
    assert.match(h.get('content-security-policy'), /default-src 'none'/);
    assert.equal(h.get('x-powered-by'), null);
    assert.equal(h.get('strict-transport-security'), null);
  });

  test('production adds HSTS and only allows listed origins', async () => {
    const config = loadConfig({ JWT_SECRET: SECRET, CORS_ORIGIN: 'https://app.example' });
    const allowed = await headersFor(config, 'https://app.example');
    assert.match(allowed.get('strict-transport-security'), /max-age=31536000/);
    assert.equal(allowed.get('access-control-allow-origin'), 'https://app.example');
    const other = await headersFor(config, 'https://evil.example');
    assert.equal(other.get('access-control-allow-origin'), null);
  });
});

describe('server startup', () => {
  test('refuses to start in production without a secret or CORS origin', () => {
    const env = { PATH: process.env.PATH, PORT: '0', DB_FILE: ':memory:' }; // no NODE_ENV, JWT_SECRET or CORS_ORIGIN
    const r = spawnSync(process.execPath, [SERVER], { env, encoding: 'utf8', timeout: 10_000 });
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stderr, /refused to start/);
    assert.match(r.stderr, /JWT_SECRET is required/);
    assert.match(r.stderr, /CORS_ORIGIN is required/);
  });
});
