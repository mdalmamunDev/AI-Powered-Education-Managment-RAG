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

router.use(auth());
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export const CourseRoutes = router;
