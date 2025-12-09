import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { loginRateLimiter, registerRateLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/register', registerRateLimiter, authController.register);
router.post('/login', loginRateLimiter, authController.login);
router.post('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);
router.get('/profile', authMiddleware, authController.getProfile);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.get('/current-role', authMiddleware, authController.getCurrentRole);

export default router;
