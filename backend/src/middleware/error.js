import { logger } from '../utils/logger.js';

export function notFound(req, res) {
  res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'The requested resource was not found.' } });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.code === 'INVALID_CREDENTIALS' || error.code === 'OTP_INVALID' ? 401
    : error.code === 'OTP_RESEND_THROTTLED' || error.code === 'OTP_ATTEMPTS_EXCEEDED' ? 429
    : error.code === 'SESSION_INVALID' || error.code === 'SESSION_REVOKED' ? 401
    : error.statusCode || 500;
  logger.error({ err: error, path: req.path, requestId: req.id }, 'Request failed');
  res.status(status).json({ ok: false, error: { code: error.code || 'INTERNAL_ERROR', message: status >= 500 ? 'An unexpected server error occurred.' : error.message } });
}
