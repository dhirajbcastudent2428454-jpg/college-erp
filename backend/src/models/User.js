import mongoose from 'mongoose';

export const ROLE_PERMISSIONS = {
  super_admin: ['dashboard:read', 'users:manage', 'settings:manage', 'audit:read', 'students:manage'],
  principal: ['dashboard:read', 'reports:read', 'notices:publish', 'students:read'],
  hod: ['dashboard:read', 'department:read', 'attendance:review', 'timetable:approve'],
  teacher: ['dashboard:read', 'attendance:write', 'marks:write', 'leave:request'],
  student: ['dashboard:read', 'profile:read:self', 'attendance:read:self', 'fees:read:self'],
  office_staff: ['dashboard:read', 'students:manage', 'admissions:manage'],
  accountant: ['dashboard:read', 'fees:manage', 'payments:record'],
  librarian: ['dashboard:read', 'library:manage'],
  exam_controller: ['dashboard:read', 'exams:manage', 'results:publish'],
  hr_staff: ['dashboard:read', 'staff:manage', 'leave:approve']
};

const userSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true, sparse: true, unique: true },
  username: { type: String, lowercase: true, trim: true, sparse: true, unique: true },
  collegeId: { type: String, uppercase: true, trim: true, sparse: true, unique: true },
  phone: { type: String, trim: true, sparse: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: String, enum: Object.keys(ROLE_PERMISSIONS), required: true },
  permissions: { type: [String], default: [] },
  passwordHash: { type: String, required: true, select: false },
  status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
  emailVerifiedAt: Date,
  lastLoginAt: Date,
  isDemo: { type: Boolean, default: false }
}, { timestamps: true, strict: 'throw' });

userSchema.index({ role: 1, status: 1 });
userSchema.index({ name: 'text', email: 'text', collegeId: 'text' });

export const User = mongoose.model('User', userSchema);
