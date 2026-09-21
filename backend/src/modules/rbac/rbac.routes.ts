import express from 'express';
import auth from '../../middlewares/auth';
import { getRbacDash } from './rbac.controller';

const router = express.Router();

router.get('/', auth(), getRbacDash);
export const RbacRoutes = router;

