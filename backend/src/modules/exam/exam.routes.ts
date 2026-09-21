import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} from './exam.controller';

const router = express.Router();

router.get('/', auth('exam.read'), getAllExams);
router.get('/:id', auth('exam.read'), getExamById);
router.post('/', auth('exam.create'), createExam);
router.put('/:id', auth('exam.update'), updateExam);
router.delete('/:id', auth('exam.delete'), deleteExam);

export const ExamRoutes = router;
