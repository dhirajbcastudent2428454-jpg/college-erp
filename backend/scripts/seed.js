import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { env } from '../src/config/env.js';
import { User, ROLE_PERMISSIONS } from '../src/models/User.js';
import { hashPassword } from '../src/utils/crypto.js';
import { ensureDemoUsers, memory } from '../src/services/store.js';

if (env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true') {
  console.error('Refusing to seed. Use NODE_ENV=development and ALLOW_DEMO_SEED=true for a disposable development database.');
  process.exit(1);
}

const accounts = [
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

const db = await connectDatabase();
if (db.connected) {
  for (const [email, name, role, password, collegeId] of accounts) {
    await User.updateOne({ email }, { $setOnInsert: { email, name, role, collegeId, username: role, permissions: ROLE_PERMISSIONS[role], passwordHash: await hashPassword(password), status: 'active', isDemo: true } }, { upsert: true });
  }
  console.log(`Seeded ${accounts.length} role-specific demo accounts into MongoDB.`);
  await disconnectDatabase();
} else {
  await ensureDemoUsers();
  console.log(`Prepared ${memory.users.size} in-memory demo accounts for development fallback.`);
}
