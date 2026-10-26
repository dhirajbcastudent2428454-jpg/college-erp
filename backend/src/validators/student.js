import { z } from 'zod';

export const studentCreateSchema = z.object({
  enrollmentNo: z.string().trim().min(3).max(30).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(120),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  guardianName: z.string().trim().max(120).optional().or(z.literal('')),
  department: z.string().trim().min(2).max(120),
  course: z.string().trim().min(2).max(120),
  batch: z.string().trim().min(2).max(40),
  semester: z.coerce.number().int().min(1).max(12),
  academicSession: z.string().trim().min(4).max(30),
  admissionDate: z.coerce.date().default(() => new Date())
});

export const studentQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(['active', 'graduated', 'suspended', 'withdrawn']).optional(),
  department: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
