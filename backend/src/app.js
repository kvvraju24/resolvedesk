import express from 'express';
import cors from 'cors';
import { authenticate, setSigningSecret } from './auth.js';
import { loadConfig } from './config.js';
import { loadModel } from './classifier.js';
import { openDb } from './db.js';
import { coreRouter } from './routes/core.js';
import { requestsRouter } from './routes/requests.js';
import { ensureBaseData } from './baseData.js';

// Standard headers for a JSON-only API. HSTS only in production, where TLS is expected.
function securityHeaders(production) {
  return (_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    });
    if (production) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  };
}

// `config` defaults to the validated environment; tests can pass their own.
export function createApp({ dbFile, modelVersion, config = loadConfig() } = {}) {
  setSigningSecret(config.jwtSecret);
  const db = openDb(dbFile);
  const model = loadModel(modelVersion);
  ensureBaseData(db, model, { demo: config.demoMode });
  const ctx = {
    db,
    model,
    demo: config.demoMode,
    threshold: () => db.prepare('SELECT threshold FROM model_versions WHERE is_active = 1').get()?.threshold ?? model.threshold,
  };

  const app = express();
  app.disable('x-powered-by');
  app.use(securityHeaders(config.production));
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '50kb' }));
  app.use(authenticate(db));
  app.use('/api', coreRouter(ctx));
  app.use('/api', requestsRouter(ctx));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
  });
  return { app, db, ctx, config };
}
