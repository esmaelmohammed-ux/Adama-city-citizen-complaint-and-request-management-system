import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { aiProxy } from './middleware/aiProxy.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { isAllowedOrigin } from './utils/publicOrigin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);

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

  const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });
  app.use('/uploads', express.static(uploadDir));

  app.use('/api/ai', aiProxy);
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
