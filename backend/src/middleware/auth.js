import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getUserForToken } from '../services/authService.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.erp_access_token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ ok: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.' } });
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await getUserForToken(payload);
    if (!user) return res.status(401).json({ ok: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.' } });
    req.auth = { user, payload };
    next();
  } catch { return res.status(401).json({ ok: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication is required.' } }); }
}

export function requirePermission(permission) { return (req, res, next) => { if (!req.auth?.user?.permissions?.includes(permission)) return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Your role is not authorized for this action.' } }); next(); }; }
export function requireAnyPermission(permissions) { return (req, res, next) => { if (!permissions.some((permission) => req.auth?.user?.permissions?.includes(permission))) return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Your role is not authorized for this action.' } }); next(); }; }
