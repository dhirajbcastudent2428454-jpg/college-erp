import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true, maxlength: 120 },
  resourceType: { type: String, required: true, maxlength: 80 },
  resourceId: String,
  ipHash: String,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true }
}, { strict: 'throw' });

auditLogSchema.index({ actorUserId: 1, createdAt: -1 });
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
