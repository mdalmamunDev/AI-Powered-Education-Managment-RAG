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

router.use(auth());
router.get('/', getAllSchedules);
router.get('/:id', getScheduleById);
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);

export const ScheduleRoutes = router;
