import express from 'express';
import auth from '../../middlewares/auth';
import { register, login, me, updateProfile } from './auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth('profile.read'), me);
router.patch('/me', auth('profile.update'), updateProfile);

export const AuthRoutes = router;
