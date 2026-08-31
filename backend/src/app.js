import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const configured = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
  if (origin === configured) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
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

  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  app.use('/uploads', express.static(path.resolve(uploadDir)));

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
