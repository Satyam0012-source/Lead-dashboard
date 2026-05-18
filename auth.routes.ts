import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../validators';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);

export default router;
