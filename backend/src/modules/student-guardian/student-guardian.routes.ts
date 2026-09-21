import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllStudentGuardianLinks,
  getStudentGuardianLinkById,
  createStudentGuardianLink,
  updateStudentGuardianLink,
  deleteStudentGuardianLink,
} from './student-guardian.controller';

const router = express.Router();

router.get('/', auth('student-guardian.read'), getAllStudentGuardianLinks);
router.get('/:id', auth('student-guardian.read'), getStudentGuardianLinkById);
router.post('/', auth('student-guardian.create'), createStudentGuardianLink);
router.put('/:id', auth('student-guardian.update'), updateStudentGuardianLink);
router.delete('/:id', auth('student-guardian.delete'), deleteStudentGuardianLink);

export const StudentGuardianLinkRoutes = router;
