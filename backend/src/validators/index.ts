import { z } from 'zod';
import { UserRole, DocumentStatus, StageStatus } from '../types';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const createDocumentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  fileLink: z.string().url('Invalid file link URL'),
  approverIds: z
    .array(z.string())
    .min(1, 'At least one approver is required')
    .max(10, 'Maximum 10 approvers allowed')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Duplicate approvers are not allowed',
    }),
});

export const approveRejectSchema = z.object({
  comment: z.string().optional().default(''),
});

export const paginationSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.nativeEnum(DocumentStatus).optional(),
});
