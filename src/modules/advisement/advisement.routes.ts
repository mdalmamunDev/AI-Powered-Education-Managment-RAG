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

router.use(auth());
router.get('/', getAllAdvisements);
router.get('/:id', getAdvisementById);
router.post('/', createAdvisement);
router.put('/:id', updateAdvisement);
router.delete('/:id', deleteAdvisement);

export const AdvisementRoutes = router;
