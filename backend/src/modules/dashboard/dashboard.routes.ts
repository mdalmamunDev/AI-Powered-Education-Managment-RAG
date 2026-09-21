import express from 'express';
import auth from '../../middlewares/auth';
import { getDashboardData } from './dashboard.controller';

const router = express.Router();

router.get('/', auth('dashboard.read'), getDashboardData);

export const DashboardRoutes = router;