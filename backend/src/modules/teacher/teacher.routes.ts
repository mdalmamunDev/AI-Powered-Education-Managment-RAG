import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from './teacher.controller';

const router = express.Router();

router.get('/', auth('teacher.read'), getAllTeachers);
router.get('/:id', auth('teacher.read'), getTeacherById);
router.post('/', auth('teacher.create'), createTeacher);
router.put('/:id', auth('teacher.update'), updateTeacher);
router.delete('/:id', auth('teacher.delete'), deleteTeacher);

export const TeacherRoutes = router;
