import express from 'express';
import auth from '../../middlewares/auth';
import { getRbacDash } from './rbac.controller';

const router = express.Router();

router.use(auth());
router.get('/', getRbacDash);
export const RbacRoutes = router;

