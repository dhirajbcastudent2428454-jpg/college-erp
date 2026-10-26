import express from 'express';
import crypto from 'node:crypto';
import { validate } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema, requestOtpSchema, verifyOtpSchema } from '../validators/auth.js';
import { fail, ok } from '../utils/response.js';
import { env } from '../config/env.js';
import { sha256, randomToken } from '../utils/crypto.js';
import { login as loginUser, verifyOtp, rotateRefreshToken, revokeSession, revokeAllSessions, getUserForToken, issueOtp } from '../services/authService.js';
import { findMemoryUser, ensureDemoUsers } from '../services/store.js';
import { User } from '../models/User.js';
import { isDatabaseReady } from '../config/database.js';

const router = express.Router();
const accessCookie = { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: env.COOKIE_SECURE ? 'none' : 'lax', maxAge: 15 * 60 * 1000, path: '/' };
const refreshCookie = { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: env.COOKIE_SECURE ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/v1/auth' };
const csrfCookie = { httpOnly: false, secure: env.COOKIE_SECURE, sameSite: env.COOKIE_SECURE ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' };

function setSessionCookies(res, session) {
  res.cookie('erp_access_token', session.accessToken, accessCookie);
  res.cookie('erp_refresh_token', session.refreshToken, refreshCookie);
  res.cookie('erp_csrf', randomToken(18), csrfCookie);
}

function clearSessionCookies(res) {
  res.clearCookie('erp_access_token', { ...accessCookie, maxAge: undefined });
  res.clearCookie('erp_refresh_token', { ...refreshCookie, maxAge: undefined });
  res.clearCookie('erp_csrf', { ...csrfCookie, maxAge: undefined });
}

function ipHash(req) { return sha256(req.ip || 'unknown'); }
function requireCsrf(req, res, next) {
  if (req.cookies?.erp_access_token && req.cookies.erp_csrf !== req.get('x-csrf-token')) return fail(res, 403, 'CSRF_REQUIRED', 'A valid CSRF token is required.');
  next();
}

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try { return ok(res, await loginUser({ ...req.body, ipHash: ipHash(req) })); } catch (error) { return next(error); }
});

router.post('/otp/request', validate(requestOtpSchema), async (req, res, next) => {
  try {
    const { identifier, purpose } = req.body;
    let user;
    if (isDatabaseReady() && env.MONGODB_URI) user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }, { collegeId: identifier.toUpperCase() }] }).select('+passwordHash');
    else { await ensureDemoUsers(); user = findMemoryUser(identifier); }
    if (user?.status === 'active') await issueOtp({ user, purpose, ipHash: ipHash(req) });
    return res.status(202).json({ ok: true, data: { message: 'If the account is eligible, a verification code has been sent.' } });
  } catch (error) { return next(error); }
});

router.post('/otp/verify', validate(verifyOtpSchema), async (req, res, next) => {
  try { const session = await verifyOtp({ ...req.body, ipHash: ipHash(req), userAgent: req.get('user-agent') }); setSessionCookies(res, session); return ok(res, { user: session.user }); } catch (error) { return next(error); }
});

router.post('/refresh', requireCsrf, async (req, res, next) => {
  try { const token = req.cookies?.erp_refresh_token; if (!token) return fail(res, 401, 'SESSION_INVALID', 'Session is no longer valid.'); const session = await rotateRefreshToken(token, { ipHash: ipHash(req), userAgent: req.get('user-agent') }); setSessionCookies(res, session); return ok(res, { user: session.user }); } catch (error) { clearSessionCookies(res); return next(error); }
});

router.post('/logout', requireCsrf, async (req, res, next) => {
  try { if (req.auth?.payload?.sid) await revokeSession(req.auth.payload.sid); clearSessionCookies(res); return ok(res, { message: 'Signed out.' }); } catch (error) { return next(error); }
});

router.post('/logout-all', requireAuth, requireCsrf, async (req, res, next) => {
  try { await revokeAllSessions(req.auth.user._id); clearSessionCookies(res); return ok(res, { message: 'All sessions were signed out.' }); } catch (error) { return next(error); }
});

router.get('/me', requireAuth, async (req, res) => ok(res, { user: { id: req.auth.user._id.toString(), name: req.auth.user.name, email: req.auth.user.email, collegeId: req.auth.user.collegeId, role: req.auth.user.role, permissions: req.auth.user.permissions, isDemo: req.auth.user.isDemo } }));
router.get('/sessions', requireAuth, async (req, res) => ok(res, { sessions: [{ id: req.auth.payload.sid, current: true, lastSeen: new Date().toISOString() }] }));
router.delete('/sessions/:id', requireAuth, async (req, res, next) => { try { await revokeSession(req.params.id, 'user-revoked'); return ok(res, { message: 'Session revoked.' }); } catch (error) { return next(error); } });

export { setSessionCookies, clearSessionCookies };
export default router;
