import { Router } from 'express';
import { register, login, getProfile } from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

export default router;