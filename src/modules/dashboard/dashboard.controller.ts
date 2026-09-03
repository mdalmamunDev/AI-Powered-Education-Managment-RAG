import { StatusCodes } from 'http-status-codes';
import { sendResponse } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import { prisma } from '../../../prisma/prisma';

// GET /api/v1/dashboard
// Returns totals (students, teachers, courses) and bar-chart data of
// course enrollments in the format:
//   chartBar: { labels: [course name, ...], data: [total enrollments of labels[i] course] }
export const getDashboardData = catchAsync(async (req: any, res: any) => {
  const [studentCount, teacherCount, guardianCount, courseCount, courses, enrollmentGroups, recentStudents] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.parentGuardian.count(),
    prisma.course.count(),
    prisma.course.findMany({
      orderBy: { courseName: 'asc' },
      select: { id: true, courseName: true },
    }),
    prisma.enrollment.groupBy({
      by: ['courseId'],
      _count: { _all: true },
    }),
    prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, status: true, department: { select: { id: true, departmentName: true } } },
    }),
  ]);

  const enrollmentCountByCourse = new Map(
    enrollmentGroups.map((group) => [group.courseId, group._count._all])
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    data: {
      totals: {
        students: studentCount,
        teachers: teacherCount,
        courses: courseCount,
        guardians: guardianCount,
      },
      chartBar: {
        labels: courses.map((course) => course.courseName),
        data: courses.map((course) => enrollmentCountByCourse.get(course.id) || 0),
      },
      recentStudents
    },
  });
});