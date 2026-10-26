import express from 'express';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { ok } from '../utils/response.js';
import { studentStats } from '../services/studentService.js';

const router = express.Router();
router.get('/summary', requireAuth, requirePermission('dashboard:read'), async (req, res, next) => { try { const students = await studentStats(); return ok(res, { user: { name: req.auth.user.name, role: req.auth.user.role }, metrics: { activeSession: 1, permissions: req.auth.user.permissions.length, pendingApprovals: 0, students: students.total, activeStudents: students.active }, modules: req.auth.user.permissions.map((permission) => permission.split(':')[0]).filter((item, index, items) => items.indexOf(item) === index) }); } catch (error) { return next(error); } });
export default router;
