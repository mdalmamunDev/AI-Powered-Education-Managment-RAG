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

router.get('/', auth('submission.read'), getAllSubmissions);
router.get('/:id', auth('submission.read'), getSubmissionById);
router.post('/', auth('submission.create'), createSubmission);
router.put('/:id', auth('submission.update'), updateSubmission);
router.delete('/:id', auth('submission.delete'), deleteSubmission);

export const SubmissionRoutes = router;
