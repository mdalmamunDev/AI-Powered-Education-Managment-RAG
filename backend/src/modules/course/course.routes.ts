import express from 'express';
import auth from '../../middlewares/auth';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from './course.controller';

const router = express.Router();

router.get('/', auth('course.read'), getAllCourses);
router.get('/:id', auth('course.read'), getCourseById);
router.post('/', auth('course.create'), createCourse);
router.put('/:id', auth('course.update'), updateCourse);
router.delete('/:id', auth('course.delete'), deleteCourse);

export const CourseRoutes = router;
