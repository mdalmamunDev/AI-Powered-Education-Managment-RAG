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
router.get('/', auth('department.read'), getAllDepartments);
router.get('/:id', auth('department.read'), getDepartmentById);
router.post('/', auth('department.create'), createDepartment);
router.put('/:id', auth('department.update'), updateDepartment);
router.delete('/:id', auth('department.delete'), deleteDepartment);

export const DepartmentRoutes = router;
