import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { createUserSchema, updateUserSchema } from './user.validation';
import {
  getAllUsers,
  getUserById,
  getAssignableRoles,
  createUser,
  updateUser,
  deleteUser,
} from './user.controller';

const router = express.Router();

// The "user.*" keys are seeded by prisma/seed/rbac.seed.ts (RBAC group -> User
// module). The role/rbac keys are accepted as alternatives so a database seeded
// before those keys existed — where an admin already holds role.*/rbac.read —
// can still manage accounts.
const canRead = auth('user.read', 'role.read', 'rbac.read');

// Literal routes first, otherwise "/roles" would be swallowed by "/:id".
router.get('/roles', canRead, getAssignableRoles);

router.get('/', canRead, getAllUsers);
router.get('/:id', canRead, getUserById);
router.post('/', auth('user.create', 'role.create'), validate(createUserSchema), createUser);
// Also used for a role-only assignment: PUT /users/:id { role }
router.put('/:id', auth('user.update', 'role.update'), validate(updateUserSchema), updateUser);
router.delete('/:id', auth('user.delete', 'role.delete'), deleteUser);

export const UserRoutes = router;
