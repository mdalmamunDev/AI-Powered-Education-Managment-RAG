import express from 'express';
import auth from '../../middlewares/auth';
import { getDashboardData } from './dashboard.controller';

const router = express.Router();

router.use(auth());
router.get('/', getDashboardData);

export const DashboardRoutes = router;