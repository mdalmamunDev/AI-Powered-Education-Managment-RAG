import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from './schedule.controller';

const router = express.Router();

router.get('/', auth('schedule.read'), getAllSchedules);
router.get('/:id', auth('schedule.read'), getScheduleById);
router.post('/', auth('schedule.create'), createSchedule);
router.put('/:id', auth('schedule.update'), updateSchedule);
router.delete('/:id', auth('schedule.delete'), deleteSchedule);

export const ScheduleRoutes = router;
