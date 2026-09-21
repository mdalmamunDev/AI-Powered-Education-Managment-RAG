import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from './assignment.controller';

const router = express.Router();

router.get('/', auth('assignment.read'), getAllAssignments);
router.get('/:id', auth('assignment.read'), getAssignmentById);
router.post('/', auth('assignment.create'), createAssignment);
router.put('/:id', auth('assignment.update'), updateAssignment);
router.delete('/:id', auth('assignment.delete'), deleteAssignment);

export const AssignmentRoutes = router;
