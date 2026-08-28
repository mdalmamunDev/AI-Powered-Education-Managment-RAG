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

router.use(auth());
router.get('/', getAllExams);
router.get('/:id', getExamById);
router.post('/', createExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

export const ExamRoutes = router;
