import { isDatabaseReady } from '../config/database.js';
import { env } from '../config/env.js';
import { Student } from '../models/Student.js';
import { memory } from './store.js';

export async function listStudents({ q, status, department, page, limit }) {
  if (isDatabaseReady() && env.MONGODB_URI) {
    const filter = { deletedAt: { $exists: false }, ...(status ? { status } : {}), ...(department ? { department } : {}) };
    if (q) filter.$or = [{ name: new RegExp(escapeRegex(q), 'i') }, { enrollmentNo: new RegExp(escapeRegex(q), 'i') }, { email: new RegExp(escapeRegex(q), 'i') }];
    const [items, total] = await Promise.all([Student.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Student.countDocuments(filter)]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }
  const normalized = q?.toLowerCase();
  const filtered = memory.students.filter((student) => !student.deletedAt && (!status || student.status === status) && (!department || student.department === department) && (!normalized || [student.name, student.enrollmentNo, student.email].some((value) => value?.toLowerCase().includes(normalized))));
  const items = filtered.slice((page - 1) * limit, page * limit);
  return { items, total: filtered.length, page, limit, pages: Math.ceil(filtered.length / limit) };
}

export async function createStudent(input) {
  if (isDatabaseReady() && env.MONGODB_URI) return Student.create({ ...input, status: 'active' });
  if (memory.students.some((student) => student.enrollmentNo === input.enrollmentNo)) { const error = new Error('Enrollment number already exists'); error.code = 'DUPLICATE_ENROLLMENT'; throw error; }
  const student = { _id: `student-${memory.students.length + 1}`, ...input, status: 'active', isDemo: false, createdAt: new Date() };
  memory.students.push(student);
  return student;
}

export async function studentStats() {
  if (isDatabaseReady() && env.MONGODB_URI) return { total: await Student.countDocuments({ deletedAt: { $exists: false } }), active: await Student.countDocuments({ status: 'active', deletedAt: { $exists: false } }) };
  return { total: memory.students.filter((student) => !student.deletedAt).length, active: memory.students.filter((student) => student.status === 'active' && !student.deletedAt).length };
}

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
