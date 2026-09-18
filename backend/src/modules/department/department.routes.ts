import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from './department.controller';

const router = express.Router();

router.use(auth());
router.get('/', auth('department.read'), getAllDepartments);
router.get('/:id', getDepartmentById);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export const DepartmentRoutes = router;
