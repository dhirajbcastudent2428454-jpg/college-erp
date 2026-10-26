import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import crypto from 'node:crypto';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { requireAuth } from './middleware/auth.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import systemRoutes from './routes/system.js';
import dashboardRoutes from './routes/dashboard.js';
import studentRoutes from './routes/students.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.join(rootDir, 'frontend');
const publicDir = path.join(rootDir, 'public');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(pinoHttp({ logger, genReqId: () => crypto.randomUUID() }));
  app.use(helmet({ frameguard: false, contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], objectSrc: ["'none'"], frameAncestors: ['https:'] } }, crossOriginEmbedderPolicy: false }));
  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'] }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.use('/api/v1', systemRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/students', studentRoutes);
  app.get('/api/v1/private-check', requireAuth, (req, res) => res.json({ ok: true, data: { role: req.auth.user.role } }));
  app.use(express.static(publicDir, { dotfiles: 'deny' }));
  app.use(express.static(frontendDir, { extensions: ['html'], index: 'index.html', dotfiles: 'deny' }));
  app.get('/', (req, res) => res.sendFile(path.join(frontendDir, 'index.html')));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
