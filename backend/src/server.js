import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { app } = createApp({ dbFile: process.env.DB_FILE || path.join(root, 'data', 'resolvedesk.db') });
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`ResolveDesk API on http://localhost:${port}`));
