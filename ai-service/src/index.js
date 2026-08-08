import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, resolveEffectiveProvider } from './config.js';
import { connectDbOptional } from './services/similar.js';
import aiRoutes from './routes/ai.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'adama-citizen-ai-service',
    provider: resolveEffectiveProvider(),
    port: config.port,
  });
});

app.use('/api/ai', aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

await connectDbOptional();

app.listen(config.port, () => {
  console.log(`[ai] Helper UI  → http://localhost:${config.port}`);
  console.log(`[ai] API        → http://localhost:${config.port}/api/ai`);
  console.log(`[ai] Provider   → ${resolveEffectiveProvider()}`);
});
