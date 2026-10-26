import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  enrollmentNo: { type: String, required: true, uppercase: true, trim: true, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, lowercase: true, trim: true, sparse: true },
  phone: { type: String, trim: true },
  guardianName: { type: String, trim: true, maxlength: 120 },
  department: { type: String, required: true, trim: true, maxlength: 120 },
  course: { type: String, required: true, trim: true, maxlength: 120 },
  batch: { type: String, required: true, trim: true, maxlength: 40 },
  semester: { type: Number, required: true, min: 1, max: 12 },
  academicSession: { type: String, required: true, trim: true, maxlength: 30 },
  admissionDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'graduated', 'suspended', 'withdrawn'], default: 'active' },
  isDemo: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true, strict: 'throw' });

studentSchema.index({ department: 1, course: 1, status: 1 });
studentSchema.index({ name: 'text', enrollmentNo: 'text', email: 'text' });
export const Student = mongoose.model('Student', studentSchema);
