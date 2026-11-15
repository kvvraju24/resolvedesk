import { Router } from 'express';
import { classify } from '../classifier.js';
import { tx } from '../db.js';
import { requireRole } from '../auth.js';
import { assign, leastLoadedAgent, teamForCategory, TRANSITIONS } from '../routing.js';

const STAFF = ['agent', 'admin'];

export function requestsRouter(ctx) {
  const { db } = ctx;
  const r = Router();

  const detail = (id) => {
    const req = db.prepare(`
      SELECT r.*, t.name AS team_name, t.slug AS team_slug, u.name AS customer_name, u.email AS customer_email
      FROM requests r LEFT JOIN teams t ON t.id = r.team_id JOIN users u ON u.id = r.customer_id
      WHERE r.id = ?`).get(id);
    if (!req) return null;
    const p = db.prepare('SELECT * FROM predictions WHERE request_id = ? ORDER BY id DESC LIMIT 1').get(id);
    req.prediction = p && { ...p, alternatives: JSON.parse(p.alternatives_json || '[]'), alternatives_json: undefined };
    req.assignment = db.prepare(`
      SELECT a.*, u.name AS agent_name FROM assignments a LEFT JOIN users u ON u.id = a.agent_id
      WHERE a.request_id = ? AND a.active = 1`).get(id) ?? null;
    return req;
  };

  const canSee = (user, req) => STAFF.includes(user.role) || req.customer_id === user.id;

  const validText = (v, min, max) => typeof v === 'string' && v.trim().length >= min && v.trim().length <= max;

  // Classify arbitrary text without creating a request (agents: "what would the model say?").
  r.post('/classify', requireRole(), (req, res) => {
    if (!validText(req.body?.text, 3, 2000)) return res.status(400).json({ error: 'Text must be 3–2000 characters.' });
    const out = classify(ctx.model, req.body.text);
    res.json({ ...out, threshold: ctx.threshold(), autoRoute: out.confidence >= ctx.threshold() });
  });

  // Submit request -> classify -> auto-route or send to review.
  r.post('/requests', requireRole('customer'), (req, res) => {
    const { subject, body } = req.body ?? {};
    if (!validText(subject, 3, 140)) return res.status(400).json({ error: 'Subject must be 3–140 characters.' });
    if (!validText(body, 10, 2000)) return res.status(400).json({ error: 'Please describe your issue in 10–2000 characters.' });
    const pred = classify(ctx.model, `${subject}. ${body}`);
    const threshold = ctx.threshold();
    const auto = pred.confidence >= threshold;
    const id = tx(db, () => {
      const team = auto ? teamForCategory(db, ctx.model, pred.category) : null;
      const { lastInsertRowid } = db.prepare(`
        INSERT INTO requests (customer_id, subject, body, category, team_id, status, routing)
        VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
        req.user.id, subject.trim(), body.trim(), auto ? pred.category : null, team?.id ?? null,
        auto ? 'open' : 'needs_review', auto ? 'auto' : 'manual');
      const rid = Number(lastInsertRowid);
      db.prepare(`INSERT INTO predictions (request_id, model_version, category, confidence, threshold, alternatives_json)
        VALUES (?, ?, ?, ?, ?, ?)`).run(rid, pred.modelVersion, pred.category, pred.confidence, threshold, JSON.stringify(pred.alternatives));
      if (team) {
        const agent = leastLoadedAgent(db, team.id);
        assign(db, { requestId: rid, agentId: agent?.id, teamId: team.id, reason: 'auto: confidence above threshold' });
      }
      return rid;
    });
    res.status(201).json(detail(id));
  });

  r.get('/requests', requireRole(), (req, res) => {
    const where = [];
    const args = [];
    if (req.user.role === 'customer') { where.push('r.customer_id = ?'); args.push(req.user.id); }
    if (req.query.status) { where.push('r.status = ?'); args.push(String(req.query.status)); }
    if (req.query.team) { where.push('t.slug = ?'); args.push(String(req.query.team)); }
    if (req.query.mine === '1') { where.push('a.agent_id = ?'); args.push(req.user.id); }
    const rows = db.prepare(`
      SELECT r.id, r.subject, r.status, r.routing, r.category, r.created_at, r.updated_at,
             t.name AS team_name, t.slug AS team_slug, u.name AS customer_name,
             p.category AS predicted_category, p.confidence, ag.name AS agent_name, a.agent_id
      FROM requests r
      JOIN users u ON u.id = r.customer_id
      LEFT JOIN teams t ON t.id = r.team_id
      LEFT JOIN assignments a ON a.request_id = r.id AND a.active = 1
      LEFT JOIN users ag ON ag.id = a.agent_id
      LEFT JOIN predictions p ON p.id = (SELECT MAX(id) FROM predictions WHERE request_id = r.id)
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY r.created_at DESC, r.id DESC LIMIT 500`).all(...args);
    res.json(rows);
  });

  const load = (req, res, next) => {
    const found = detail(Number(req.params.id));
    if (!found || !canSee(req.user, found)) return res.status(404).json({ error: 'Request not found.' });
    req.found = found;
    next();
  };

  r.get('/requests/:id', requireRole(), load, (req, res) => {
    const internal = STAFF.includes(req.user.role) ? '' : 'AND m.internal = 0';
    req.found.messages = db.prepare(`
      SELECT m.*, u.name AS author_name, u.role AS author_role FROM messages m JOIN users u ON u.id = m.author_id
      WHERE m.request_id = ? ${internal} ORDER BY m.id`).all(req.found.id);
    if (STAFF.includes(req.user.role)) {
      req.found.corrections = db.prepare(`SELECT c.*, u.name AS agent_name FROM corrections c JOIN users u ON u.id = c.agent_id
        WHERE request_id = ? ORDER BY c.id`).all(req.found.id);
    }
    res.json(req.found);
  });

  r.post('/requests/:id/messages', requireRole(), load, (req, res) => {
    if (!validText(req.body?.body, 1, 2000)) return res.status(400).json({ error: 'Message must be 1–2000 characters.' });
    const internal = STAFF.includes(req.user.role) && req.body.internal ? 1 : 0;
    db.prepare('INSERT INTO messages (request_id, author_id, body, internal) VALUES (?, ?, ?, ?)')
      .run(req.found.id, req.user.id, req.body.body.trim(), internal);
    db.prepare("UPDATE requests SET updated_at = datetime('now') WHERE id = ?").run(req.found.id);
    res.status(201).json({ ok: true });
  });

  r.patch('/requests/:id/status', requireRole(), load, (req, res) => {
    const next = req.body?.status;
    const allowed = TRANSITIONS[req.user.role]?.[req.found.status] ?? [];
    if (!allowed.includes(next)) {
      return res.status(422).json({ error: `Cannot change status from ${req.found.status} to ${next}.` });
    }
    if (next === 'open' && !req.found.category) {
      return res.status(422).json({ error: 'Choose a category before opening this request.' });
    }
    db.prepare("UPDATE requests SET status = ?, updated_at = datetime('now') WHERE id = ?").run(next, req.found.id);
    res.json(detail(req.found.id));
  });

  // Agent confirms or corrects the category; routes to that team.
  r.post('/requests/:id/review', requireRole(...STAFF), load, (req, res) => {
    const { category, note } = req.body ?? {};
    const team = teamForCategory(db, ctx.model, category);
    if (!team) return res.status(400).json({ error: 'Unknown category.' });
    const predicted = req.found.prediction?.category ?? null;
    const previous = req.found.category ?? predicted;
    tx(db, () => {
      if (category !== previous) {
        db.prepare('INSERT INTO corrections (request_id, agent_id, predicted_category, new_category, note) VALUES (?, ?, ?, ?, ?)')
          .run(req.found.id, req.user.id, previous, category, note ?? null);
      }
      const status = ['needs_review', 'rejected'].includes(req.found.status) ? 'open' : req.found.status;
      db.prepare("UPDATE requests SET category = ?, team_id = ?, status = ?, updated_at = datetime('now') WHERE id = ?")
        .run(category, team.id, status, req.found.id);
      if (req.found.assignment?.team_id !== team.id) {
        const agent = leastLoadedAgent(db, team.id);
        assign(db, { requestId: req.found.id, agentId: agent?.id, teamId: team.id, by: req.user.id,
          reason: category === predicted ? 'review: prediction confirmed' : 'review: category corrected' });
      }
    });
    res.json(detail(req.found.id));
  });

  r.post('/requests/:id/assign', requireRole(...STAFF), load, (req, res) => {
    const agent = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'agent'").get(Number(req.body?.agentId));
    if (!agent) return res.status(400).json({ error: 'Choose a valid agent.' });
    if (!req.found.category) return res.status(422).json({ error: 'Review the category before assigning.' });
    assign(db, { requestId: req.found.id, agentId: agent.id, teamId: agent.team_id, by: req.user.id, reason: 'manual assignment' });
    db.prepare("UPDATE requests SET team_id = ?, updated_at = datetime('now') WHERE id = ?").run(agent.team_id, req.found.id);
    res.json(detail(req.found.id));
  });

  return r;
}
