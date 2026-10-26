import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();
const db = await connectDatabase();
const server = app.listen(env.PORT, '0.0.0.0', () => logger.info({ port: env.PORT, databaseMode: db.mode }, 'College ERP server listening'));

async function shutdown(signal) {
  logger.info({ signal }, 'Graceful shutdown started');
  server.close(async () => { await disconnectDatabase(); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
