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

router.get('/', auth('guardian.read'), getAllGuardians);
router.get('/:id', auth('guardian.read'), getGuardianById);
router.post('/', auth('guardian.create'), createGuardian);
router.put('/:id', auth('guardian.update'), updateGuardian);
router.delete('/:id', auth('guardian.delete'), deleteGuardian);

export const GuardianRoutes = router;
