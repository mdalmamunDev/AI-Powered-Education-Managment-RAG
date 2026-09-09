import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllOfficeHours,
  getOfficeHourById,
  createOfficeHour,
  updateOfficeHour,
  deleteOfficeHour,
} from './office-hours.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllOfficeHours);
router.get('/:id', getOfficeHourById);
router.post('/', createOfficeHour);
router.put('/:id', updateOfficeHour);
router.delete('/:id', deleteOfficeHour);

export const OfficeHourRoutes = router;
