import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getDashboardStats);

export default router;
