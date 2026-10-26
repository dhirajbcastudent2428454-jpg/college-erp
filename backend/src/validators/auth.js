import { z } from 'zod';

export const loginSchema = z.object({ identifier: z.string().trim().min(3).max(160), password: z.string().min(8).max(128) });
export const verifyOtpSchema = z.object({ challengeId: z.string().trim().min(8).max(160), otp: z.string().regex(/^\d{6}$/, 'OTP must contain six digits') });
export const requestOtpSchema = z.object({ identifier: z.string().trim().min(3).max(160), purpose: z.enum(['login', 'password_reset', 'email_verification']).default('login') });
