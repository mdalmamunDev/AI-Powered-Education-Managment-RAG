import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { DepartmentRoutes } from '../modules/department/department.routes';
import { SemesterRoutes } from '../modules/semester/semester.routes';
import { TeacherRoutes } from '../modules/teacher/teacher.routes';
import { StudentRoutes } from '../modules/student/student.routes';
import { CourseRoutes } from '../modules/course/course.routes';
import { EnrollmentRoutes } from '../modules/enrollment/enrollment.routes';
import { AttendanceRoutes } from '../modules/attendance/attendance.routes';
import { GradeRoutes } from '../modules/grade/grade.routes';
import { AssignmentRoutes } from '../modules/assignment/assignment.routes';
import { SubmissionRoutes } from '../modules/submission/submission.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { ClassroomRoutes } from '../modules/classroom/classroom.routes';
import { ScheduleRoutes } from '../modules/schedule/schedule.routes';
import { ExamRoutes } from '../modules/exam/exam.routes';
import { GuardianRoutes } from '../modules/guardian/guardian.routes';
import { StudentGuardianLinkRoutes } from '../modules/student-guardian/student-guardian.routes';
import { OfficeHourRoutes } from '../modules/office-hours/office-hours.routes';
import { AdvisementRoutes } from '../modules/advisement/advisement.routes';
import { LibraryBookRoutes } from '../modules/library-book/library-book.routes';
import { BookLoanRoutes } from '../modules/book-loan/book-loan.routes';
import { AssistantRoutes } from '../modules/assistant/assistant.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { ModuleRoutes } from '../modules/rbac/module/module.routes';
import { RoleRoutes } from '../modules/rbac/role/role.routes';
import { RbacRoutes } from '../modules/rbac/rbac.routes';
import { UserRoutes } from '../modules/user/user.routes';

const router = express.Router();

const apiRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/departments', route: DepartmentRoutes },
  { path: '/semesters', route: SemesterRoutes },
  { path: '/teachers', route: TeacherRoutes },
  { path: '/students', route: StudentRoutes },
  { path: '/courses', route: CourseRoutes },
  { path: '/enrollments', route: EnrollmentRoutes },
  { path: '/attendances', route: AttendanceRoutes },
  { path: '/grades', route: GradeRoutes },
  { path: '/assignments', route: AssignmentRoutes },
  { path: '/submissions', route: SubmissionRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/classrooms', route: ClassroomRoutes },
  { path: '/schedules', route: ScheduleRoutes },
  { path: '/exams', route: ExamRoutes },
  { path: '/guardians', route: GuardianRoutes },
  { path: '/student-guardians', route: StudentGuardianLinkRoutes },
  { path: '/office-hours', route: OfficeHourRoutes },
  { path: '/advisements', route: AdvisementRoutes },
  { path: '/library-books', route: LibraryBookRoutes },
  { path: '/book-loans', route: BookLoanRoutes },
  { path: '/assistant', route: AssistantRoutes },
  { path: '/dashboard', route: DashboardRoutes },
  { path: '/modules', route: ModuleRoutes },
  { path: '/roles', route: RoleRoutes },
  { path: '/rbac', route: RbacRoutes },
  { path: '/users', route: UserRoutes },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
