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

router.get('/', auth('office-hour.read'), getAllOfficeHours);
router.get('/:id', auth('office-hour.read'), getOfficeHourById);
router.post('/', auth('office-hour.create'), createOfficeHour);
router.put('/:id', auth('office-hour.update'), updateOfficeHour);
router.delete('/:id', auth('office-hour.delete'), deleteOfficeHour);

export const OfficeHourRoutes = router;
