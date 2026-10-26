import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'development';
process.env.MONGODB_URI = '';
process.env.DEMO_AUTH_ENABLED = 'true';
process.env.COOKIE_SECURE = 'false';

const { createApp } = await import('../src/app.js');
const app = createApp();

describe('authentication foundation', () => {
  it('reports health and development readiness', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('ok');
  });

  it('requires valid credentials and then verifies a purpose-bound OTP once', async () => {
    const agent = request.agent(app);
    const login = await agent.post('/api/v1/auth/login').send({ identifier: 'admin@example.com', password: 'DemoAdmin@2026!' });
    expect(login.status).toBe(200);
    expect(login.body.data.destination).toContain('***@example.com');
    expect(login.body.data.debugOtp).toMatch(/^\d{6}$/);

    const invalid = await agent.post('/api/v1/auth/otp/verify').send({ challengeId: login.body.data.challengeId, otp: '000000' });
    expect(invalid.status).toBe(401);

    const verified = await agent.post('/api/v1/auth/otp/verify').send({ challengeId: login.body.data.challengeId, otp: login.body.data.debugOtp });
    expect(verified.status).toBe(200);
    expect(verified.body.data.user.role).toBe('super_admin');

    const replay = await agent.post('/api/v1/auth/otp/verify').send({ challengeId: login.body.data.challengeId, otp: login.body.data.debugOtp });
    expect(replay.status).toBe(401);

    const me = await agent.get('/api/v1/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe('admin@example.com');

    const dashboard = await agent.get('/api/v1/dashboard/summary');
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.metrics.permissions).toBe(5);

    const students = await agent.get('/api/v1/students').query({ q: 'aarav' });
    expect(students.status).toBe(200);
    expect(students.body.data.total).toBe(1);
    expect(students.body.data.items[0].enrollmentNo).toBe('CS-2026-001');
  });

  it('does not authenticate with an invalid password', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({ identifier: 'admin@example.com', password: 'wrong-password' });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
