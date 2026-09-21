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

router.get('/', auth('role.read'), getAllRoles);
router.post('/', validate(createRoleSchema), auth('role.create'), createRole);
router.put('/:id', auth('role.update'), updateRole);
router.delete('/:id', auth('role.delete'), deleteRole);

export const RoleRoutes = router;

