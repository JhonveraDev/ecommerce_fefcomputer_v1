import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_AUTH_ATTEMPTS', message: 'Intenta nuevamente más tarde.' } },
});

export const authRouter = Router();

authRouter.post('/register', authRateLimit, authController.register);
authRouter.post('/login', authRateLimit, authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);
