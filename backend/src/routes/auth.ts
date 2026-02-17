import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', validate(refreshTokenSchema), authController.logout);

export default router;
