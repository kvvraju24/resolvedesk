import express from 'express';
import cors from 'cors';
import { authenticate } from './auth.js';
import { loadModel } from './classifier.js';
import { openDb } from './db.js';
import { coreRouter } from './routes/core.js';
import { requestsRouter } from './routes/requests.js';
import { ensureBaseData } from './baseData.js';

export function createApp({ dbFile, modelVersion } = {}) {
  const db = openDb(dbFile);
  const model = loadModel(modelVersion);
  ensureBaseData(db, model);
  const ctx = {
    db,
    model,
    threshold: () => db.prepare('SELECT threshold FROM model_versions WHERE is_active = 1').get()?.threshold ?? model.threshold,
  };

  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
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
  return { app, db, ctx };
}
