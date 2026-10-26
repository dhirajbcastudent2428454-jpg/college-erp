import { hashPassword } from '../utils/crypto.js';
import { ROLE_PERMISSIONS } from '../models/User.js';

const demoAccounts = [
  ['admin@example.com', 'Super Admin', 'super_admin', 'DemoAdmin@2026!', 'ADMIN-001'],
  ['principal@example.com', 'Principal', 'principal', 'DemoPrincipal@2026!', 'PRIN-001'],
  ['hod@example.com', 'Head of Department', 'hod', 'DemoHOD@2026!', 'HOD-001'],
  ['teacher@example.com', 'Demo Teacher', 'teacher', 'DemoTeacher@2026!', 'TEA-001'],
  ['student@example.com', 'Demo Student', 'student', 'DemoStudent@2026!', 'STU-001'],
  ['office@example.com', 'Office Staff', 'office_staff', 'DemoOffice@2026!', 'OFF-001'],
  ['accountant@example.com', 'Accountant', 'accountant', 'DemoAccount@2026!', 'ACC-001'],
  ['librarian@example.com', 'Librarian', 'librarian', 'DemoLibrary@2026!', 'LIB-001'],
  ['exams@example.com', 'Examination Controller', 'exam_controller', 'DemoExam@2026!', 'EXAM-001'],
  ['hr@example.com', 'HR Staff', 'hr_staff', 'DemoHR@2026!', 'HR-001']
];

export const memory = { users: new Map(), challenges: new Map(), sessions: new Map(), auditLogs: [], students: [] };

export async function ensureDemoUsers() {
  if (memory.users.size) return;
  for (const [email, name, role, password, collegeId] of demoAccounts) memory.users.set(email, { _id: `demo-${role}`, email, username: role, collegeId, name, role, permissions: ROLE_PERMISSIONS[role], passwordHash: await hashPassword(password), status: 'active', isDemo: true });
  memory.students.push({ _id: 'student-demo-1', enrollmentNo: 'CS-2026-001', name: 'Aarav Mehta', email: 'student@example.com', phone: '+91 90000 00001', guardianName: 'Rohit Mehta', department: 'Computer Science', course: 'B.Tech Computer Science', batch: '2026', semester: 3, academicSession: '2026-27', admissionDate: new Date('2025-08-01'), status: 'active', isDemo: true, createdAt: new Date() });
  memory.students.push({ _id: 'student-demo-2', enrollmentNo: 'BA-2026-014', name: 'Mira Shah', email: 'mira@example.com', phone: '+91 90000 00002', guardianName: 'Neel Shah', department: 'Business Administration', course: 'BBA', batch: '2026', semester: 3, academicSession: '2026-27', admissionDate: new Date('2025-08-01'), status: 'active', isDemo: true, createdAt: new Date() });
}

export function findMemoryUser(identifier) { const normalized = String(identifier).trim().toLowerCase(); return [...memory.users.values()].find((user) => [user.email, user.username, user.collegeId?.toLowerCase()].includes(normalized)); }
