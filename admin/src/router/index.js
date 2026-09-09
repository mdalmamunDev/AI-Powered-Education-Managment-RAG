// src/router.js
import { createRouter, createWebHistory } from "vue-router";
import NotFoundPage from "../pages/NotFoundPage.vue";
import AuthLayout from "../components/AuthLayout.vue";
import AppLayout from "../components/AppLayout.vue";
import LoginPage from "../pages/auth/LoginPage.vue";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.vue";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage.vue";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.vue";
import DashboardPage from "@/pages/DashboardPage.vue";

// Education Management resources
import DepartmentPage from "@/pages/DepartmentPage.vue";
import SemesterPage from "@/pages/SemesterPage.vue";
import TeacherPage from "@/pages/TeacherPage.vue";
import StudentPage from "@/pages/StudentPage.vue";
import GuardianPage from "@/pages/GuardianPage.vue";
import StudentGuardianPage from "@/pages/StudentGuardianPage.vue";
import CoursePage from "@/pages/CoursePage.vue";
import EnrollmentPage from "@/pages/EnrollmentPage.vue";
import AttendancePage from "@/pages/AttendancePage.vue";
import GradePage from "@/pages/GradePage.vue";
import AssignmentPage from "@/pages/AssignmentPage.vue";
import SubmissionPage from "@/pages/SubmissionPage.vue";
import ExamPage from "@/pages/ExamPage.vue";
import SchedulePage from "@/pages/SchedulePage.vue";
import ClassroomPage from "@/pages/ClassroomPage.vue";
import PaymentPage from "@/pages/PaymentPage.vue";
import OfficeHourPage from "@/pages/OfficeHourPage.vue";
import AdvisementPage from "@/pages/AdvisementPage.vue";
import LibraryBookPage from "@/pages/LibraryBookPage.vue";
import BookLoanPage from "@/pages/BookLoanPage.vue";

// Settings
import ProfilePage from "@/pages/settings/ProfilePage.vue";
import ChangePassPage from "@/pages/settings/ChangePassPage.vue";

const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      { path: "login", component: LoginPage, meta: { title: "Login", dataUrl: "auth/login" } },
      { path: "forgot-password", component: ForgotPasswordPage, meta: { title: "Forgot Password", dataUrl: "auth/forgot-password" } },
      { path: "verify-email", component: VerifyEmailPage, meta: { title: "Verify Email", dataUrl: "auth/verify-email" } },
      { path: "reset-password", component: ResetPasswordPage, meta: { title: "Reset Password", dataUrl: "auth/reset-password" } },
    ],
  },

  {
    path: "/",
    component: AppLayout,
    children: [
      { path: "", redirect: "/dashboard" },
      { path: "/dashboard", component: DashboardPage, meta: { title: "Dashboard", dataUrl: "dashboard" } },

      // Academics
      { path: "/departments", component: DepartmentPage, meta: { title: "Department", dataUrl: "departments" } },
      { path: "/semesters", component: SemesterPage, meta: { title: "Semester", dataUrl: "semesters" } },

      // People
      { path: "/teachers", component: TeacherPage, meta: { title: "Teacher", dataUrl: "teachers" } },
      { path: "/students", component: StudentPage, meta: { title: "Student", dataUrl: "students" } },
      { path: "/guardians", component: GuardianPage, meta: { title: "Guardian", dataUrl: "guardians" } },
      { path: "/student-guardians", component: StudentGuardianPage, meta: { title: "Student Guardian", dataUrl: "student-guardians" } },

      // Courses & learning
      { path: "/courses", component: CoursePage, meta: { title: "Course", dataUrl: "courses" } },
      { path: "/enrollments", component: EnrollmentPage, meta: { title: "Enrollment", dataUrl: "enrollments" } },
      { path: "/attendances", component: AttendancePage, meta: { title: "Attendance", dataUrl: "attendances" } },
      { path: "/grades", component: GradePage, meta: { title: "Grade", dataUrl: "grades" } },
      { path: "/assignments", component: AssignmentPage, meta: { title: "Assignment", dataUrl: "assignments" } },
      { path: "/submissions", component: SubmissionPage, meta: { title: "Submission", dataUrl: "submissions" } },
      { path: "/exams", component: ExamPage, meta: { title: "Exam", dataUrl: "exams" } },

      // Administration & finance
      { path: "/classrooms", component: ClassroomPage, meta: { title: "Classroom", dataUrl: "classrooms" } },
      { path: "/schedules", component: SchedulePage, meta: { title: "Schedule", dataUrl: "schedules" } },
      { path: "/payments", component: PaymentPage, meta: { title: "Payment", dataUrl: "payments" } },
      { path: "/office-hours", component: OfficeHourPage, meta: { title: "Office Hours", dataUrl: "office-hours" } },
      { path: "/advisements", component: AdvisementPage, meta: { title: "Advisement", dataUrl: "advisements" } },

      // Library
      { path: "/library-books", component: LibraryBookPage, meta: { title: "Library Book", dataUrl: "library-books" } },
      { path: "/book-loans", component: BookLoanPage, meta: { title: "Book Loan", dataUrl: "book-loans" } },

      // Settings
      { path: "profile", component: ProfilePage, meta: { title: "Profile", dataUrl: "auth/me" } },
      { path: "change-password", component: ChangePassPage, meta: { title: "Change Password", dataUrl: "auth/change-password" } },
    ]
  },

  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFoundPage, meta: { title: "404 - Page Not Found" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/auth/login", "/auth/forgot-password", "/auth/verify-email", "/auth/reset-password"];
  const token = localStorage.getItem("token");

  // If user is logged in, don't permit visiting public pages
  if (token && publicPages.includes(to.path)) {
    return next("/");
  }

  const authRequired = !publicPages.includes(to.path) && !to.path.startsWith("/auth");

  document.title = `EduTech | ${to.meta.title || "Admin"}`;

  if (authRequired && !token) {
    return next("/auth/login");
  }
  next();
});

export default router;