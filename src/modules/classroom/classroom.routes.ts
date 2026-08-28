import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from './classroom.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllClassrooms);
router.get('/:id', getClassroomById);
router.post('/', createClassroom);
router.put('/:id', updateClassroom);
router.delete('/:id', deleteClassroom);

export const ClassroomRoutes = router;
