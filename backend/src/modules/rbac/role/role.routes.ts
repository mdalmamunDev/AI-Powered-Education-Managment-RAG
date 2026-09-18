import express from 'express';
import auth from '../../../middlewares/auth';
import validate from '../../../middlewares/validate';
import { createRoleSchema } from './role.validation';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from './role.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllRoles);
router.post('/', validate(createRoleSchema), createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export const RoleRoutes = router;

