import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from './enrollment.controller';

const router = express.Router();
router.get('/', auth('enrollment.read'), getAllEnrollments);
router.get('/:id', auth('enrollment.read'), getEnrollmentById);
router.post('/', auth('enrollment.create'), createEnrollment);
router.put('/:id', auth('enrollment.update'), updateEnrollment);
router.delete('/:id', auth('enrollment.delete'), deleteEnrollment);

export const EnrollmentRoutes = router;
