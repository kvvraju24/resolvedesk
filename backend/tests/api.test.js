import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { classify } from '../src/classifier.js';
import { DEMO_PASSWORD } from '../src/baseData.js';

let server, base, ctx;
const tokens = {};

async function call(method, url, who, body) {
  const res = await fetch(base + url, {
    method,
    headers: { 'content-type': 'application/json', ...(tokens[who] && { authorization: `Bearer ${tokens[who]}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

before(async () => {
  const made = createApp({ dbFile: ':memory:' });
  ctx = made.ctx;
  server = made.app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
  for (const [who, email] of [['alex', 'alex@example.com'], ['jordan', 'jordan@example.com'],
    ['maya', 'maya@resolvedesk.dev'], ['admin', 'admin@resolvedesk.dev']]) {
    const r = await call('POST', '/auth/login', null, { email, password: DEMO_PASSWORD });
    assert.equal(r.status, 200);
    tokens[who] = r.body.token;
  }
});
after(() => server.close());

describe('classifier', () => {
  test('reproduces the Python model predictions (parity fixtures)', () => {
    for (const p of ctx.model.parity) {
      const out = classify(ctx.model, p.text);
      assert.equal(out.category, p.label, p.text);
      assert.ok(Math.abs(out.confidence - p.confidence) < 1e-3, `${p.text}: ${out.confidence} vs ${p.confidence}`);
    }
  });

  test('POST /classify returns category, team and routing decision', async () => {
    const r = await call('POST', '/classify', 'maya', { text: 'I want to book a flight to Paris' });
    assert.equal(r.status, 200);
    assert.equal(r.body.category, 'book_flight');
    assert.equal(r.body.team, 'travel');
    assert.equal(r.body.autoRoute, true);
  });
});

describe('auth & permissions', () => {
  test('rejects bad credentials', async () => {
    const r = await call('POST', '/auth/login', null, { email: 'alex@example.com', password: 'nope' });
    assert.equal(r.status, 401);
  });

  test('self-registration always creates a customer', async () => {
    const r = await call('POST', '/auth/register', null, { email: 'new@example.com', name: 'New', password: 'longenough', role: 'admin' });
    assert.equal(r.status, 201);
    assert.equal(r.body.user.role, 'customer');
  });

  test('anonymous users cannot list requests', async () => {
    assert.equal((await call('GET', '/requests', null)).status, 401);
  });

  test('customers cannot view analytics or change the threshold', async () => {
    assert.equal((await call('GET', '/analytics', 'alex')).status, 403);
    assert.equal((await call('PUT', '/settings/threshold', 'maya', { threshold: 0.1 })).status, 403);
  });
});

describe('request workflow', () => {
  let autoId, reviewId;

  test('confident request is auto-routed to the right team and an agent', async () => {
    const r = await call('POST', '/requests', 'alex', { subject: 'Lost card', body: 'I lost my credit card yesterday, please report it' });
    assert.equal(r.status, 201);
    assert.equal(r.body.routing, 'auto');
    assert.equal(r.body.status, 'open');
    assert.equal(r.body.team_slug, 'cards');
    assert.ok(r.body.assignment.agent_id);
    autoId = r.body.id;
  });

  test('uncertain request goes to human review', async () => {
    const r = await call('POST', '/requests', 'alex', { subject: 'Hello', body: 'Can you tell me a joke about cats please' });
    assert.equal(r.status, 201);
    assert.equal(r.body.status, 'needs_review');
    assert.equal(r.body.category, null);
    reviewId = r.body.id;
  });

  test('validates input', async () => {
    const r = await call('POST', '/requests', 'alex', { subject: '', body: 'short' });
    assert.equal(r.status, 400);
    assert.match(r.body.error, /Subject/);
  });

  test('customers only see their own requests', async () => {
    assert.equal((await call('GET', `/requests/${autoId}`, 'jordan')).status, 404);
    const mine = await call('GET', '/requests', 'jordan');
    assert.ok(mine.body.every((x) => x.id !== autoId));
    assert.equal((await call('GET', `/requests/${autoId}`, 'alex')).status, 200);
  });

  test('customers cannot review or assign', async () => {
    assert.equal((await call('POST', `/requests/${reviewId}/review`, 'alex', { category: 'balance' })).status, 403);
  });

  test('agent correction records a correction and routes to the new team', async () => {
    const before = await call('GET', `/requests/${reviewId}`, 'maya');
    const category = before.body.prediction.category === 'balance' ? 'transfer' : 'balance';
    const r = await call('POST', `/requests/${reviewId}/review`, 'maya', { category, note: 'asked about banking' });
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'open');
    assert.equal(r.body.team_slug, 'banking');
    const d = await call('GET', `/requests/${reviewId}`, 'maya');
    assert.equal(d.body.corrections.length, 1);
    assert.equal(d.body.corrections[0].new_category, category);
  });

  test('status transitions are enforced', async () => {
    assert.equal((await call('PATCH', `/requests/${autoId}/status`, 'maya', { status: 'closed' })).status, 422);
    assert.equal((await call('PATCH', `/requests/${autoId}/status`, 'maya', { status: 'in_progress' })).status, 200);
    assert.equal((await call('PATCH', `/requests/${autoId}/status`, 'alex', { status: 'closed' })).status, 422);
    assert.equal((await call('PATCH', `/requests/${autoId}/status`, 'maya', { status: 'resolved' })).status, 200);
    assert.equal((await call('PATCH', `/requests/${autoId}/status`, 'alex', { status: 'closed' })).status, 200);
  });

  test('internal notes are hidden from customers', async () => {
    await call('POST', `/requests/${autoId}/messages`, 'maya', { body: 'internal only', internal: true });
    await call('POST', `/requests/${autoId}/messages`, 'maya', { body: 'public reply' });
    const c = await call('GET', `/requests/${autoId}`, 'alex');
    assert.deepEqual(c.body.messages.map((m) => m.body), ['public reply']);
  });

  test('manual assignment to a specific agent', async () => {
    const agents = (await call('GET', '/agents', 'maya')).body;
    const omar = agents.find((a) => a.name.startsWith('Omar'));
    const r = await call('POST', `/requests/${reviewId}/assign`, 'maya', { agentId: omar.id });
    assert.equal(r.status, 200);
    assert.equal(r.body.assignment.agent_id, omar.id);
  });

  test('analytics reports live counts and offline metrics', async () => {
    const r = await call('GET', '/analytics', 'maya');
    assert.equal(r.status, 200);
    assert.equal(r.body.live.total, 2);
    assert.equal(r.body.live.corrections, 1);
    assert.ok(r.body.offline.test.accuracy > 0.9);
    assert.equal(r.body.live.points.length, 2);
  });

  test('admin can change the threshold, which changes routing', async () => {
    assert.equal((await call('PUT', '/settings/threshold', 'admin', { threshold: 1 })).status, 200);
    const r = await call('POST', '/requests', 'alex', { subject: 'Transfer', body: 'Transfer 50 dollars to my savings account' });
    assert.equal(r.body.status, 'needs_review');
    await call('PUT', '/settings/threshold', 'admin', { threshold: ctx.model.threshold });
  });

  test('unknown endpoints return JSON 404', async () => {
    assert.equal((await call('GET', '/nope', 'maya')).status, 404);
  });
});
