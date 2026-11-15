import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { ConfigError, loadConfig } from './config.js';

let config;
try {
  config = loadConfig();
} catch (e) {
  if (!(e instanceof ConfigError)) throw e;
  console.error(`ResolveDesk API refused to start.\n${e.message}\nSet NODE_ENV=development to run locally without these settings.`);
  process.exit(1);
}
for (const w of config.warnings) console.warn(`warning: ${w}`);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { app } = createApp({ dbFile: process.env.DB_FILE || path.join(root, 'data', 'resolvedesk.db'), config });
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`ResolveDesk API (${config.mode}) on http://localhost:${port}`));
