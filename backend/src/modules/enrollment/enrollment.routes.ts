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

router.use(auth());
router.get('/', getAllEnrollments);
router.get('/:id', getEnrollmentById);
router.post('/', createEnrollment);
router.put('/:id', updateEnrollment);
router.delete('/:id', deleteEnrollment);

export const EnrollmentRoutes = router;
