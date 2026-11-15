// Serves the TF-IDF + logistic regression model exported by python/train.py.
// Re-implements sklearn's TfidfVectorizer (1-2 grams, sublinear tf, l2 norm)
// and multinomial softmax so the API has no Python runtime dependency.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODEL_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'model');
const TOKEN_RE = /[\p{L}\p{N}_]{2,}/gu;

export function loadModel(version) {
  const file = version
    ? `${version}.json`
    : fs.readdirSync(MODEL_DIR).filter((f) => f.endsWith('.json') && !f.includes('metrics')).sort().at(-1);
  const m = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, file), 'utf8'));
  m.index = new Map(m.terms.map((t, i) => [t, i]));
  const metricsFile = path.join(MODEL_DIR, `${m.version}.metrics.json`);
  m.metrics = fs.existsSync(metricsFile) ? JSON.parse(fs.readFileSync(metricsFile, 'utf8')) : null;
  return m;
}

export function loadComparisons() {
  return fs.readdirSync(MODEL_DIR)
    .filter((f) => f.endsWith('.metrics.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(MODEL_DIR, f), 'utf8')))
    .map(({ version, model, threshold, test }) => ({ version, model, threshold, test }));
}

function vectorize(model, text) {
  const tokens = text.toLowerCase().match(TOKEN_RE) ?? [];
  const grams = [...tokens];
  for (let i = 0; i + 1 < tokens.length; i++) grams.push(`${tokens[i]} ${tokens[i + 1]}`);
  const tf = new Map();
  for (const g of grams) {
    const i = model.index.get(g);
    if (i !== undefined) tf.set(i, (tf.get(i) ?? 0) + 1);
  }
  let norm = 0;
  for (const [i, c] of tf) {
    const v = (1 + Math.log(c)) * model.idf[i];
    tf.set(i, v);
    norm += v * v;
  }
  norm = Math.sqrt(norm) || 1;
  for (const [i, v] of tf) tf.set(i, v / norm);
  return tf;
}

export function classify(model, text) {
  const x = vectorize(model, text);
  const logits = model.coef.map((row, k) => {
    let s = model.intercept[k];
    for (const [i, v] of x) s += row[i] * v;
    return s;
  });
  const max = Math.max(...logits);
  const exp = logits.map((l) => Math.exp(l - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  const probs = exp.map((e) => e / sum);
  const ranked = probs
    .map((p, k) => ({ category: model.classes[k], team: model.category_to_team[model.classes[k]], confidence: p }))
    .sort((a, b) => b.confidence - a.confidence);
  return { ...ranked[0], alternatives: ranked.slice(1, 4), modelVersion: model.version };
}
