import express from 'express';
import { requireAuth, requireAnyPermission } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { studentCreateSchema, studentQuerySchema } from '../validators/student.js';
import { createStudent, listStudents } from '../services/studentService.js';
import { created, ok } from '../utils/response.js';

const router = express.Router();
router.use(requireAuth);
router.get('/', requireAnyPermission(['students:read', 'students:manage']), validate(studentQuerySchema, 'query'), async (req, res, next) => { try { return ok(res, await listStudents(req.validatedQuery)); } catch (error) { return next(error); } });
router.post('/', requireAnyPermission(['students:manage']), validate(studentCreateSchema), async (req, res, next) => { try { return created(res, await createStudent(req.body)); } catch (error) { if (error.code === 'DUPLICATE_ENROLLMENT') error.statusCode = 409; return next(error); } });
export default router;
