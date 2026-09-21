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

router.get('/', auth('grade.read'), getAllGrades);
router.get('/:id', auth('grade.read'), getGradeById);
router.post('/', auth('grade.create'), createGrade);
router.put('/:id', auth('grade.update'), updateGrade);
router.delete('/:id', auth('grade.delete'), deleteGrade);

export const GradeRoutes = router;
