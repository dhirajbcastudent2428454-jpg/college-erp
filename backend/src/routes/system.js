import express from 'express';
import { isDatabaseReady } from '../config/database.js';
import { env } from '../config/env.js';

const router = express.Router();
router.get('/health', (req, res) => res.status(200).json({ ok: true, data: { service: 'college-erp', status: 'ok', environment: env.NODE_ENV } }));
router.get('/ready', (req, res) => {
  const ready = isDatabaseReady();
  res.status(ready ? 200 : 503).json({ ok: ready, data: { ready, database: ready ? 'available' : 'unavailable' } });
});
export default router;
