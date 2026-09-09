import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} from './grade.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllGrades);
router.get('/:id', getGradeById);
router.post('/', createGrade);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);

export const GradeRoutes = router;
