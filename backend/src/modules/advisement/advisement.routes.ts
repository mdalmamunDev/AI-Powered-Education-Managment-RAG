import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllAdvisements,
  getAdvisementById,
  createAdvisement,
  updateAdvisement,
  deleteAdvisement,
} from './advisement.controller';

const router = express.Router();

router.get('/', auth('advisement.read'), getAllAdvisements);
router.get('/:id', auth('advisement.read'), getAdvisementById);
router.post('/', auth('advisement.create'), createAdvisement);
router.put('/:id', auth('advisement.update'), updateAdvisement);
router.delete('/:id', auth('advisement.delete'), deleteAdvisement);

export const AdvisementRoutes = router;
