import mongoose from 'mongoose';

const otpChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  purpose: { type: String, enum: ['login', 'password_reset', 'email_verification'], required: true },
  destination: { type: String, required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0, min: 0 },
  maxAttempts: { type: Number, default: 5 },
  usedAt: Date,
  invalidatedAt: Date,
  requestIpHash: String
}, { timestamps: true, strict: 'throw' });

otpChallengeSchema.index({ userId: 1, purpose: 1, createdAt: -1 });
export const OTPChallenge = mongoose.model('OTPChallenge', otpChallengeSchema);
