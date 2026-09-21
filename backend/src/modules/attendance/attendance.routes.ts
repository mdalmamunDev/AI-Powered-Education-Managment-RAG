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

router.get('/', auth('attendance.read'), getAllAttendances);
router.get('/:id', auth('attendance.read'), getAttendanceById);
router.post('/', auth('attendance.create'), createAttendance);
router.put('/:id', auth('attendance.update'), updateAttendance);
router.delete('/:id', auth('attendance.delete'), deleteAttendance);

export const AttendanceRoutes = router;
