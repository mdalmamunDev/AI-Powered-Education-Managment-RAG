import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllSemesters,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester,
} from './semester.controller';

const router = express.Router();

router.get('/', auth('semester.read'), getAllSemesters);
router.get('/:id', auth('semester.read'), getSemesterById);
router.post('/', auth('semester.create'), createSemester);
router.put('/:id', auth('semester.update'), updateSemester);
router.delete('/:id', auth('semester.delete'), deleteSemester);

export const SemesterRoutes = router;
