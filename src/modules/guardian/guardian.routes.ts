import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllGuardians,
  getGuardianById,
  createGuardian,
  updateGuardian,
  deleteGuardian,
} from './guardian.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllGuardians);
router.get('/:id', getGuardianById);
router.post('/', createGuardian);
router.put('/:id', updateGuardian);
router.delete('/:id', deleteGuardian);

export const GuardianRoutes = router;
