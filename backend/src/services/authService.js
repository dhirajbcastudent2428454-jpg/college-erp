import jwt from 'jsonwebtoken';
import { env, isDevelopmentDemo } from '../config/env.js';
import { isDatabaseReady } from '../config/database.js';
import { User } from '../models/User.js';
import { OTPChallenge } from '../models/OTPChallenge.js';
import { Session } from '../models/Session.js';
import { AuditLog } from '../models/AuditLog.js';
import { memory, findMemoryUser, ensureDemoUsers } from './store.js';
import { hashPassword, verifyPassword, randomOtp, randomToken, sha256 } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

const accessMaxAgeMs = 15 * 60 * 1000;
const refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

async function findUser(identifier) {
  if (isDatabaseReady() && env.MONGODB_URI) {
    const normalized = String(identifier).trim().toLowerCase();
    return User.findOne({ $or: [{ email: normalized }, { username: normalized }, { collegeId: String(identifier).trim().toUpperCase() }] }).select('+passwordHash');
  }
  await ensureDemoUsers();
  return findMemoryUser(identifier);
}

async function findUserById(id) {
  if (isDatabaseReady() && env.MONGODB_URI) return User.findById(id).select('+passwordHash');
  await ensureDemoUsers();
  return [...memory.users.values()].find((user) => user._id === id);
}

async function writeAudit({ actorUserId, action, resourceType, resourceId, ipHash, metadata = {} }) {
  const safeMetadata = Object.fromEntries(Object.entries(metadata).filter(([key]) => !/password|token|otp|secret/i.test(key)).map(([key, value]) => [key, valueForAudit(value)]));
  if (isDatabaseReady() && env.MONGODB_URI) return AuditLog.create({ actorUserId, action, resourceType, resourceId, ipHash, metadata: safeMetadata });
  memory.auditLogs.push({ actorUserId, action, resourceType, resourceId, ipHash, metadata: safeMetadata, createdAt: new Date() });
}

function valueForAudit(value) {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string' && value.length > 200) return value.slice(0, 200);
  return value;
}

export async function login({ identifier, password, ipHash }) {
  const user = await findUser(identifier);
  if (!user || user.status !== 'active' || !(await verifyPassword(password, user.passwordHash))) {
    await writeAudit({ action: 'auth.login_failed', resourceType: 'User', ipHash, metadata: { identifierType: identifier.includes('@') ? 'email' : 'identifier' } });
    const error = new Error('Invalid credentials'); error.code = 'INVALID_CREDENTIALS'; throw error;
  }
  const challenge = await issueOtp({ user, purpose: 'login', ipHash });
  await writeAudit({ actorUserId: user._id, action: 'auth.otp_requested', resourceType: 'OTPChallenge', resourceId: challenge.id, ipHash, metadata: { purpose: 'login' } });
  return { challengeId: challenge.id, destination: maskDestination(user.email), debugOtp: isDevelopmentDemo ? challenge.debugOtp : undefined };
}

export async function issueOtp({ user, purpose, ipHash }) {
  const now = Date.now();
  if (isDatabaseReady() && env.MONGODB_URI) {
    await OTPChallenge.updateMany({ userId: user._id, purpose, usedAt: { $exists: false }, invalidatedAt: { $exists: false } }, { $set: { invalidatedAt: new Date() } });
  } else {
    for (const challenge of memory.challenges.values()) if (challenge.userId === user._id && challenge.purpose === purpose && !challenge.usedAt) challenge.invalidatedAt = new Date();
  }
  const lastIssued = isDatabaseReady() && env.MONGODB_URI
    ? await OTPChallenge.findOne({ userId: user._id, purpose }).sort({ createdAt: -1 })
    : [...memory.challenges.values()].filter((entry) => entry.userId === user._id && entry.purpose === purpose).sort((a, b) => b.createdAt - a.createdAt)[0];
  if (lastIssued && now - new Date(lastIssued.createdAt).getTime() < env.OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    const error = new Error('Please wait before requesting another code'); error.code = 'OTP_RESEND_THROTTLED'; throw error;
  }
  const otp = randomOtp();
  const challengeData = { userId: user._id, purpose, destination: user.email, codeHash: sha256(otp), expiresAt: new Date(now + env.OTP_TTL_SECONDS * 1000), attempts: 0, maxAttempts: env.OTP_MAX_ATTEMPTS, requestIpHash: ipHash };
  if (isDatabaseReady() && env.MONGODB_URI) {
    const doc = await OTPChallenge.create(challengeData);
    await deliverOtp(user.email, otp, purpose);
    return { id: doc._id.toString(), debugOtp: otp };
  }
  const id = randomToken(12);
  memory.challenges.set(id, { ...challengeData, id, createdAt: new Date(), debugOtp: otp });
  await deliverOtp(user.email, otp, purpose);
  return { id, debugOtp: otp };
}

async function deliverOtp(destination, otp, purpose) {
  if (isDevelopmentDemo) {
    logger.info({ destination: maskDestination(destination), purpose }, 'Development-only OTP generated; value is available only through the guarded development response');
    return;
  }
  logger.info({ destination: maskDestination(destination), purpose }, 'OTP delivery adapter placeholder invoked');
}

export async function verifyOtp({ challengeId, otp, ipHash, userAgent }) {
  let challenge;
  if (isDatabaseReady() && env.MONGODB_URI) challenge = await OTPChallenge.findById(challengeId);
  else challenge = memory.challenges.get(challengeId);
  if (!challenge || challenge.usedAt || challenge.invalidatedAt || new Date(challenge.expiresAt).getTime() < Date.now()) {
    const error = new Error('Invalid or expired code'); error.code = 'OTP_INVALID'; throw error;
  }
  if (challenge.attempts >= challenge.maxAttempts) {
    const error = new Error('Too many attempts'); error.code = 'OTP_ATTEMPTS_EXCEEDED'; throw error;
  }
  const valid = sha256(otp) === challenge.codeHash;
  if (!valid) {
    if (isDatabaseReady() && env.MONGODB_URI) await OTPChallenge.findByIdAndUpdate(challengeId, { $inc: { attempts: 1 } });
    else challenge.attempts += 1;
    const error = new Error('Invalid or expired code'); error.code = 'OTP_INVALID'; throw error;
  }
  if (isDatabaseReady() && env.MONGODB_URI) {
    const consumed = await OTPChallenge.findOneAndUpdate({ _id: challengeId, usedAt: { $exists: false }, invalidatedAt: { $exists: false }, attempts: { $lt: challenge.maxAttempts }, expiresAt: { $gt: new Date() } }, { $set: { usedAt: new Date() } }, { new: true });
    if (!consumed) { const error = new Error('Invalid or expired code'); error.code = 'OTP_INVALID'; throw error; }
  } else challenge.usedAt = new Date();
  const user = await findUserById(challenge.userId);
  if (!user || user.status !== 'active') { const error = new Error('Account unavailable'); error.code = 'ACCOUNT_UNAVAILABLE'; throw error; }
  const session = await createSession(user, { ipHash, userAgent });
  await writeAudit({ actorUserId: user._id, action: 'auth.login_succeeded', resourceType: 'Session', resourceId: session.sessionId, ipHash, metadata: { role: user.role } });
  return { user: publicUser(user), ...session };
}

async function createSession(user, { ipHash, userAgent }) {
  const sessionId = randomToken(16);
  const familyId = randomToken(16);
  const refreshToken = randomToken(48);
  const refreshTokenHash = sha256(refreshToken);
  const expiresAt = new Date(Date.now() + refreshMaxAgeMs);
  const data = { userId: user._id, familyId, refreshTokenHash, userAgent, ipHash, expiresAt, lastUsedAt: new Date() };
  if (isDatabaseReady() && env.MONGODB_URI) await Session.create(data);
  else memory.sessions.set(sessionId, { ...data, _id: sessionId });
  const accessToken = jwt.sign({ sub: user._id.toString(), sid: sessionId, role: user.role, permissions: user.permissions }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  return { sessionId, accessToken, refreshToken, refreshExpiresAt: expiresAt };
}

export async function rotateRefreshToken(refreshToken, context = {}) {
  const hash = sha256(refreshToken);
  const session = isDatabaseReady() && env.MONGODB_URI ? await Session.findOne({ refreshTokenHash: hash }) : [...memory.sessions.values()].find((item) => item.refreshTokenHash === hash);
  if (!session) { const error = new Error('Invalid session'); error.code = 'SESSION_INVALID'; throw error; }
  if (session.revokedAt || new Date(session.expiresAt).getTime() < Date.now()) {
    if (isDatabaseReady() && env.MONGODB_URI) await Session.updateMany({ familyId: session.familyId }, { $set: { revokedAt: new Date(), revokeReason: 'refresh-reuse-detected' } });
    else for (const item of memory.sessions.values()) if (item.familyId === session.familyId) item.revokedAt = new Date();
    const error = new Error('Session revoked'); error.code = 'SESSION_REVOKED'; throw error;
  }
  const user = await findUserById(session.userId);
  if (!user || user.status !== 'active') { const error = new Error('Account unavailable'); error.code = 'ACCOUNT_UNAVAILABLE'; throw error; }
  const nextRefresh = randomToken(48);
  const nextHash = sha256(nextRefresh);
  if (isDatabaseReady() && env.MONGODB_URI) {
    await Session.findOneAndUpdate({ _id: session._id, refreshTokenHash: hash, revokedAt: { $exists: false } }, { $set: { refreshTokenHash: nextHash, lastUsedAt: new Date() } });
  } else { session.refreshTokenHash = nextHash; session.lastUsedAt = new Date(); }
  const accessToken = jwt.sign({ sub: user._id.toString(), sid: session._id?.toString() || session._id, role: user.role, permissions: user.permissions }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  return { accessToken, refreshToken: nextRefresh, refreshExpiresAt: session.expiresAt, user: publicUser(user) };
}

export async function revokeSession(sessionId, reason = 'logout') {
  if (isDatabaseReady() && env.MONGODB_URI) return Session.findByIdAndUpdate(sessionId, { revokedAt: new Date(), revokeReason: reason });
  const session = memory.sessions.get(sessionId); if (session) { session.revokedAt = new Date(); session.revokeReason = reason; }
}

export async function revokeAllSessions(userId) {
  if (isDatabaseReady() && env.MONGODB_URI) return Session.updateMany({ userId, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date(), revokeReason: 'logout-all' } });
  for (const session of memory.sessions.values()) if (session.userId === userId) session.revokedAt = new Date();
}

export async function getUserForToken(payload) {
  const user = await findUserById(payload.sub);
  return user?.status === 'active' ? user : null;
}

export function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, collegeId: user.collegeId, role: user.role, permissions: user.permissions, isDemo: user.isDemo };
}

export function maskDestination(value) {
  const [name, domain] = value.split('@');
  return `${name.slice(0, 2)}***@${domain || 'configured-channel'}`;
}
