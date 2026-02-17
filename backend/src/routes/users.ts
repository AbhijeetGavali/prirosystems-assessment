import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /users/approvers:
 *   get:
 *     summary: Get all approvers
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Approvers retrieved }
 */
router.get('/approvers', authenticate, userController.getApprovers);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Users retrieved }
 *       403: { description: Forbidden }
 */
router.get('/', authenticate, authorize(UserRole.ADMIN), userController.getAllUsers);

export default router;
