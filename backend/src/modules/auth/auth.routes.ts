import express from 'express';
import auth from '../../middlewares/auth';
import { register, login, me } from './auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth('profile.read'), me);

export const AuthRoutes = router;
