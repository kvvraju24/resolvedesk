import { Router } from 'express';
import { hashPassword, issueToken, publicUser, requireRole, verifyPassword } from '../auth.js';
import { loadComparisons } from '../classifier.js';
import { modelHealth } from '../monitoring.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function coreRouter(ctx) {
  const { db } = ctx;
  const r = Router();

  r.get('/health', (_req, res) => res.json({ ok: true, model: ctx.model.version }));

  r.post('/auth/register', (req, res) => {
    const { email, name, password } = req.body ?? {};
    if (!EMAIL_RE.test(email ?? '')) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (!name?.trim()) return res.status(400).json({ error: 'Enter your name.' });
    if ((password ?? '').length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email.toLowerCase())) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    // Self-registration always creates customers; staff accounts come from seeding/admin.
    const { lastInsertRowid } = db.prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'customer')")
      .run(email.toLowerCase(), name.trim(), hashPassword(password));
    const user = publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid));
    res.status(201).json({ token: issueToken(user), user });
  });

  r.post('/auth/login', (req, res) => {
    const { email, password } = req.body ?? {};
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email ?? '').toLowerCase());
    if (!user || !verifyPassword(String(password ?? ''), user.password_hash)) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    res.json({ token: issueToken(user), user: publicUser(user) });
  });

  r.get('/auth/me', requireRole(), (req, res) => res.json(req.user));

  r.get('/teams', requireRole(), (_req, res) => {
    const teams = db.prepare('SELECT * FROM teams ORDER BY name').all();
    const cats = Object.entries(ctx.model.category_to_team);
    res.json(teams.map((t) => ({ ...t, categories: cats.filter(([, s]) => s === t.slug).map(([c]) => c) })));
  });

  r.get('/agents', requireRole('agent', 'admin'), (_req, res) => {
    res.json(db.prepare(`
      SELECT u.id, u.name, u.email, u.team_id, t.name AS team_name,
        (SELECT COUNT(*) FROM assignments a JOIN requests q ON q.id = a.request_id
          WHERE a.agent_id = u.id AND a.active = 1 AND q.status IN ('open','in_progress')) AS load
      FROM users u LEFT JOIN teams t ON t.id = u.team_id WHERE u.role = 'agent' ORDER BY t.name, u.name`).all());
  });

  r.get('/models', requireRole('agent', 'admin'), (_req, res) => {
    res.json({
      active: ctx.model.version,
      threshold: ctx.threshold(),
      versions: db.prepare('SELECT id, version, description, threshold, is_active, created_at FROM model_versions ORDER BY id').all(),
      comparisons: loadComparisons(),
    });
  });

  r.put('/settings/threshold', requireRole('admin'), (req, res) => {
    const t = Number(req.body?.threshold);
    if (!(t >= 0 && t <= 1)) return res.status(400).json({ error: 'Threshold must be between 0 and 1.' });
    db.prepare('UPDATE model_versions SET threshold = ? WHERE is_active = 1').run(t);
    res.json({ threshold: ctx.threshold() });
  });

  r.get('/analytics', requireRole('agent', 'admin'), (_req, res) => {
    const one = (sql) => db.prepare(sql).get();
    const totals = one(`SELECT COUNT(*) AS total,
        SUM(routing = 'auto') AS auto,
        SUM(status = 'needs_review') AS needs_review,
        SUM(status IN ('resolved','closed')) AS resolved,
        SUM(status = 'rejected') AS rejected FROM requests`);
    const corrections = one('SELECT COUNT(*) AS n FROM corrections').n;
    const autoCorrected = one(`SELECT COUNT(DISTINCT c.request_id) AS n FROM corrections c
      JOIN requests r ON r.id = c.request_id WHERE r.routing = 'auto'`).n;
    const byCategory = db.prepare(`SELECT COALESCE(category, 'unreviewed') AS category, COUNT(*) AS n
      FROM requests GROUP BY 1 ORDER BY n DESC`).all();
    const byStatus = db.prepare('SELECT status, COUNT(*) AS n FROM requests GROUP BY status').all();
    // Live points for the threshold slider: confidence + whether the model was right,
    // judged by the final category after human review (rejected = unsupported).
    const points = db.prepare(`
      SELECT p.confidence, p.category AS predicted, r.category AS final, r.status,
        (r.routing = 'manual' AND r.category IS NULL AND r.status != 'rejected') AS pending
      FROM requests r JOIN predictions p ON p.id = (SELECT MIN(id) FROM predictions WHERE request_id = r.id)`).all()
      .filter((p) => !p.pending)
      .map((p) => ({ confidence: p.confidence, correct: p.status !== 'rejected' && p.final === p.predicted }));
    res.json({
      threshold: ctx.threshold(),
      live: { ...totals, corrections, autoCorrected, byCategory, byStatus, points },
      offline: ctx.model.metrics,
      comparisons: loadComparisons(),
    });
  });

  // Drift and model-health checks over the last `days` days (default 7).
  r.get('/monitoring', requireRole('agent', 'admin'), (req, res) => {
    const days = req.query.days === undefined ? 7 : Number(req.query.days);
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      return res.status(400).json({ error: 'days must be a whole number from 1 to 30.' });
    }
    res.json(modelHealth(db, { model: ctx.model, threshold: ctx.threshold() }, { days }));
  });

  return r;
}
