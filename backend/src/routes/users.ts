import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();
const userController = new UserController();

router.get('/approvers', authenticate, userController.getApprovers);
router.get('/', authenticate, authorize(UserRole.ADMIN), userController.getAllUsers);

export default router;
