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

router.get('/', auth('student.read'), getAllStudents);
router.get('/:id', auth('student.read'), getStudentById);
router.post('/', auth('student.create'), createStudent);
router.put('/:id', auth('student.update'), updateStudent);
router.delete('/:id', auth('student.delete'), deleteStudent);

export const StudentRoutes = router;
