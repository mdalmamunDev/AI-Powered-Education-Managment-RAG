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

router.use(auth());
router.get('/', getAllAssignments);
router.get('/:id', getAssignmentById);
router.post('/', createAssignment);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

export const AssignmentRoutes = router;
