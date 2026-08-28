import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
} from './submission.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllSubmissions);
router.get('/:id', getSubmissionById);
router.post('/', createSubmission);
router.put('/:id', updateSubmission);
router.delete('/:id', deleteSubmission);

export const SubmissionRoutes = router;
