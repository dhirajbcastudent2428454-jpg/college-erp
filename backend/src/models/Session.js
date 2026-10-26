import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  familyId: { type: String, required: true, index: true },
  refreshTokenHash: { type: String, required: true, unique: true },
  userAgent: { type: String, maxlength: 500 },
  ipHash: String,
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: Date,
  revokeReason: String,
  lastUsedAt: Date
}, { timestamps: true, strict: 'throw' });

export const Session = mongoose.model('Session', sessionSchema);
export const RefreshToken = Session;
