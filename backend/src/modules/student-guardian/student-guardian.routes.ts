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

router.use(auth());
router.get('/', getAllStudentGuardianLinks);
router.get('/:id', getStudentGuardianLinkById);
router.post('/', createStudentGuardianLink);
router.put('/:id', updateStudentGuardianLink);
router.delete('/:id', deleteStudentGuardianLink);

export const StudentGuardianLinkRoutes = router;
