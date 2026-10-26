import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1024).max(65535).default(3000),
  MONGODB_URI: z.string().trim().optional(),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change-me-2026'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-me-2026'),
  COOKIE_SECRET: z.string().min(16).default('dev-cookie-secret-change-me-2026'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),
  OTP_TTL_SECONDS: z.coerce.number().int().min(60).max(900).default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().min(0).max(600).default(60),
  DEMO_AUTH_ENABLED: z.string().transform((value) => value === 'true').default('false'),
  COOKIE_SECURE: z.string().transform((value) => value === 'true').default('false'),
  LOG_LEVEL: z.string().default('info')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
// Demo OTP behavior is opt-in through DEMO_AUTH_ENABLED. Keep it false in normal production.
export const isDevelopmentDemo = env.DEMO_AUTH_ENABLED;

if (isProduction && !process.env.MONGODB_URI) {
  console.error('MONGODB_URI is required in production. Refusing to start without a database.');
  process.exit(1);
}
if (isProduction && env.JWT_ACCESS_SECRET.startsWith('dev-')) {
  console.error('Production JWT secrets must be replaced. Refusing to start with development defaults.');
  process.exit(1);
}
