import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import aiRoutes from '../../ai-service/src/routes/ai.routes.js';
import { connectDB } from './config/db.js';
import { assertJwtSecret } from './boot.js';
import { aiProxy, aiRateLimit } from './middleware/aiProxy.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { isAllowedOrigin } from './utils/publicOrigin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(async (req, res, next) => {
    try {
      assertJwtSecret();
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) callback(null, true);
        else callback(new Error(`Not allowed by CORS: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  const uploadDir = path.resolve(
    process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp/uploads' : 'uploads')
  );
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.warn('[uploads] could not create directory:', err.message);
  }
  app.use('/uploads', express.static(uploadDir));

  const aiRemote = (process.env.AI_SERVICE_URL || '').replace(/\/$/, '');
  if (aiRemote) {
    app.use('/api/ai', aiProxy);
  } else {
    app.use('/api/ai', aiRateLimit, aiRoutes);
  }
  app.use('/api', routes);

  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  const distIndex = path.join(frontendDist, 'index.html');
  if (fs.existsSync(distIndex)) {
    app.use(express.static(frontendDist));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
      res.sendFile(distIndex, (err) => (err ? next(err) : undefined));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
