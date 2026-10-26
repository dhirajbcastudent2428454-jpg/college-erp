import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash', '*.otp', '*.token', '*.secret'],
    censor: '[REDACTED]'
  },
  base: { service: 'college-erp' }
});
