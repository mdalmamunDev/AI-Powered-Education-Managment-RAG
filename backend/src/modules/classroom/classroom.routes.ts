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

router.get('/', auth('classroom.read'), getAllClassrooms);
router.get('/:id', auth('classroom.read'), getClassroomById);
router.post('/', auth('classroom.create'), createClassroom);
router.put('/:id', auth('classroom.update'), updateClassroom);
router.delete('/:id', auth('classroom.delete'), deleteClassroom);

export const ClassroomRoutes = router;
