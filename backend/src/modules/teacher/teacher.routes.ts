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

router.use(auth());
router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.post('/', createTeacher);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

export const TeacherRoutes = router;
