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

router.use(auth());
router.get('/', getAllSemesters);
router.get('/:id', getSemesterById);
router.post('/', createSemester);
router.put('/:id', updateSemester);
router.delete('/:id', deleteSemester);

export const SemesterRoutes = router;
