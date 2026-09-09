import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from './attendance.controller';

const router = express.Router();

router.use(auth());
router.get('/', getAllAttendances);
router.get('/:id', getAttendanceById);
router.post('/', createAttendance);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

export const AttendanceRoutes = router;
