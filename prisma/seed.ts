import bcrypt from 'bcrypt';
import { prisma } from './prisma';

async function main() {
  // ── Auth ───────────────────────────────────────────────
  const hashed = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@edu.com' },
    update: {},
    create: { name: 'System Admin', email: 'admin@edu.com', password: hashed, role: 'ADMIN' },
  });

  // ── Core academic structure ────────────────────────────
  const department = await prisma.department.upsert({
    where: { departmentName: 'Computer Science' },
    update: {},
    create: { departmentName: 'Computer Science', headOfDepartment: 'Dr. Jane Doe', location: 'Building A', phone: '555-0100' },
  });

  let semester = await prisma.semester.findFirst({
    where: { semesterName: 'Fall', academicYear: '2026-2027' },
  });
  if (!semester) {
    semester = await prisma.semester.create({
      data: {
        semesterName: 'Fall',
        academicYear: '2026-2027',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-12-20'),
      },
    });
  }

  const teacher = await prisma.teacher.upsert({
    where: { email: 'john.smith@edu.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@edu.com',
      phone: '555-0101',
      hireDate: new Date('2024-08-01'),
      specialization: 'Algorithms',
      officeLocation: 'Room 204',
      departmentId: department.id,
    },
  });

  const student = await prisma.student.upsert({
    where: { email: 'alice.johnson@edu.com' },
    update: {},
    create: {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@edu.com',
      phone: '555-0102',
      dateOfBirth: new Date('2005-03-15'),
      address: '12 Main St',
      status: 'ACTIVE',
      departmentId: department.id,
    },
  });

  const course = await prisma.course.upsert({
    where: { courseCode: 'CS101' },
    update: {},
    create: {
      courseCode: 'CS101',
      courseName: 'Intro to Programming',
      description: 'Basics of programming',
      creditHours: 3,
      maxCapacity: 40,
      teacherId: teacher.id,
      departmentId: department.id,
      semesterId: semester.id,
    },
  });

  // ── Enrollment, attendance, grading ─────────────────────
  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
    update: {},
    create: { studentId: student.id, courseId: course.id, status: 'ENROLLED' },
  });

  const attendanceDate = new Date('2026-09-05');
  const existingAttendance = await prisma.attendance.findFirst({
    where: { studentId: student.id, courseId: course.id, attendanceDate },
  });
  if (!existingAttendance) {
    await prisma.attendance.create({
      data: { studentId: student.id, courseId: course.id, attendanceDate, status: 'PRESENT', remarks: '' },
    });
  }

  const existingGrade = await prisma.grade.findFirst({
    where: { studentId: student.id, courseId: course.id, assessmentType: 'MIDTERM' },
  });
  if (!existingGrade) {
    await prisma.grade.create({
      data: { studentId: student.id, courseId: course.id, score: 88.5, gradeLetter: 'B+', assessmentType: 'MIDTERM' },
    });
  }

  // ── Assignments & submissions ───────────────────────────
  let assignment = await prisma.assignment.findFirst({
    where: { courseId: course.id, title: 'Homework 1' },
  });
  if (!assignment) {
    assignment = await prisma.assignment.create({
      data: {
        courseId: course.id,
        teacherId: teacher.id,
        title: 'Homework 1',
        description: 'Loops and conditionals',
        dueDate: new Date('2026-09-20'),
        totalPoints: 100,
      },
    });
  }

  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
    update: {},
    create: {
      assignmentId: assignment.id,
      studentId: student.id,
      score: 90,
      feedback: 'Good work',
      filePath: '/uploads/hw1_alice.pdf',
    },
  });

  // ── Payments ─────────────────────────────────────────────
  const existingPayment = await prisma.payment.findFirst({
    where: { studentId: student.id, semester: 'Fall 2026' },
  });
  if (!existingPayment) {
    await prisma.payment.create({
      data: { studentId: student.id, amount: '500.00', paymentMethod: 'CARD', semester: 'Fall 2026', status: 'PAID' },
    });
  }

  // ── Scheduling & facilities ─────────────────────────────
  const classroom = await prisma.classroom.upsert({
    where: { building_roomNumber: { building: 'Building A', roomNumber: '101' } },
    update: {},
    create: { building: 'Building A', roomNumber: '101', capacity: 50, equipment: 'Projector, Whiteboard' },
  });

  const existingSchedule = await prisma.schedule.findFirst({
    where: { courseId: course.id, classroomId: classroom.id, dayOfWeek: 'MONDAY' },
  });
  if (!existingSchedule) {
    await prisma.schedule.create({
      data: {
        courseId: course.id,
        classroomId: classroom.id,
        dayOfWeek: 'MONDAY',
        startTime: new Date('1970-01-01T09:00:00.000Z'),
        endTime: new Date('1970-01-01T10:30:00.000Z'),
        semester: 'Fall 2026',
      },
    });
  }

  const existingExam = await prisma.exam.findFirst({
    where: { courseId: course.id, examType: 'FINAL' },
  });
  if (!existingExam) {
    await prisma.exam.create({
      data: {
        courseId: course.id,
        examType: 'FINAL',
        examDate: new Date('2026-12-15'),
        duration: new Date('1970-01-01T02:00:00.000Z'),
        location: 'Hall A',
        totalMarks: 100,
      },
    });
  }

  // ── Guardians & advising ─────────────────────────────────
  let guardian = await prisma.parentGuardian.findFirst({
    where: { firstName: 'Robert', lastName: 'Johnson', relationship: 'Father' },
  });
  if (!guardian) {
    guardian = await prisma.parentGuardian.create({
      data: {
        firstName: 'Robert',
        lastName: 'Johnson',
        relationship: 'Father',
        email: 'robert.johnson@example.com',
        phone: '555-0103',
        occupation: 'Engineer',
      },
    });
  }

  await prisma.studentGuardian.upsert({
    where: { studentId_guardianId: { studentId: student.id, guardianId: guardian.id } },
    update: {},
    create: { studentId: student.id, guardianId: guardian.id },
  });

  const existingOfficeHours = await prisma.officeHours.findFirst({
    where: { teacherId: teacher.id, dayOfWeek: 'TUESDAY' },
  });
  if (!existingOfficeHours) {
    await prisma.officeHours.create({
      data: {
        teacherId: teacher.id,
        dayOfWeek: 'TUESDAY',
        startTime: new Date('1970-01-01T13:00:00.000Z'),
        endTime: new Date('1970-01-01T15:00:00.000Z'),
        location: 'Room 204',
      },
    });
  }

  const existingAdvisement = await prisma.advisement.findFirst({
    where: { studentId: student.id, teacherId: teacher.id, topic: 'Course planning' },
  });
  if (!existingAdvisement) {
    await prisma.advisement.create({
      data: {
        studentId: student.id,
        teacherId: teacher.id,
        meetingDate: new Date('2026-09-10'),
        topic: 'Course planning',
        notes: 'Discussed electives',
      },
    });
  }

  // ── Library ──────────────────────────────────────────────
  const book = await prisma.libraryBook.upsert({
    where: { isbn: '978-0135166307' },
    update: {},
    create: {
      isbn: '978-0135166307',
      title: 'Effective Java',
      author: 'Joshua Bloch',
      publisher: 'Addison-Wesley',
      publicationYear: 2018,
      category: 'Programming',
      copiesAvailable: 5,
    },
  });

  const existingLoan = await prisma.bookLoan.findFirst({
    where: { bookId: book.id, studentId: student.id, status: 'BORROWED' },
  });
  if (!existingLoan) {
    await prisma.bookLoan.create({
      data: { bookId: book.id, studentId: student.id, dueDate: new Date('2026-09-30'), status: 'BORROWED' },
    });
  }

  console.log('Seed complete.');
  console.log('  Admin login: admin@edu.com / Admin@123');
  console.log(`  Department: ${department.departmentName} (id ${department.id})`);
  console.log(`  Teacher: ${teacher.firstName} ${teacher.lastName} (id ${teacher.id})`);
  console.log(`  Student: ${student.firstName} ${student.lastName} (id ${student.id})`);
  console.log(`  Course: ${course.courseCode} (id ${course.id})`);
  console.log('  Also seeded: enrollment, attendance, grade, assignment + submission,');
  console.log('  payment, classroom + schedule, exam, guardian + link, office hours,');
  console.log('  advisement, library book + loan — every resource has at least one row.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });