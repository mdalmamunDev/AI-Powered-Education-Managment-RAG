import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from './student.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export const StudentRoutes = router;
