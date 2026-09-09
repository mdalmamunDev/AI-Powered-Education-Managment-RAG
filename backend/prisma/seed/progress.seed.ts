import { prisma } from '../prisma';
import { AcademicSeedContext } from './types';

const enrollments = [
  { studentEmail: 'alice.johnson@edu.com', courseCode: 'CS101', status: 'ENROLLED' },
  { studentEmail: 'bob.johnson@edu.com', courseCode: 'BUS102', status: 'ENROLLED' },
  { studentEmail: 'carol.johnson@edu.com', courseCode: 'MAT103', status: 'ENROLLED' },
  { studentEmail: 'daniel.johnson@edu.com', courseCode: 'PHY104', status: 'ENROLLED' },
  { studentEmail: 'eva.johnson@edu.com', courseCode: 'ENG105', status: 'ENROLLED' },
  { studentEmail: 'frank.johnson@edu.com', courseCode: 'HIS106', status: 'ENROLLED' },
  { studentEmail: 'grace.johnson@edu.com', courseCode: 'BIO107', status: 'ENROLLED' },
  { studentEmail: 'henry.johnson@edu.com', courseCode: 'ENG108', status: 'ENROLLED' },
  { studentEmail: 'ivy.johnson@edu.com', courseCode: 'ECO109', status: 'ENROLLED' },
  { studentEmail: 'jack.johnson@edu.com', courseCode: 'ART110', status: 'ENROLLED' },
];

const attendance = [
  {
    studentEmail: 'alice.johnson@edu.com',
    courseCode: 'CS101',
    attendanceDate: new Date('2026-09-05'),
    status: 'PRESENT',
    remarks: '',
  },
  { studentEmail: 'bob.johnson@edu.com', courseCode: 'BUS102', attendanceDate: new Date('2026-09-06'), status: 'PRESENT', remarks: '' },
  { studentEmail: 'carol.johnson@edu.com', courseCode: 'MAT103', attendanceDate: new Date('2026-09-07'), status: 'PRESENT', remarks: '' },
  { studentEmail: 'daniel.johnson@edu.com', courseCode: 'PHY104', attendanceDate: new Date('2026-09-08'), status: 'ABSENT', remarks: 'Medical leave' },
  { studentEmail: 'eva.johnson@edu.com', courseCode: 'ENG105', attendanceDate: new Date('2026-09-09'), status: 'PRESENT', remarks: '' },
  { studentEmail: 'frank.johnson@edu.com', courseCode: 'HIS106', attendanceDate: new Date('2026-09-10'), status: 'PRESENT', remarks: '' },
  { studentEmail: 'grace.johnson@edu.com', courseCode: 'BIO107', attendanceDate: new Date('2026-09-11'), status: 'PRESENT', remarks: '' },
  { studentEmail: 'henry.johnson@edu.com', courseCode: 'ENG108', attendanceDate: new Date('2026-09-12'), status: 'ABSENT', remarks: '' },
  { studentEmail: 'ivy.johnson@edu.com', courseCode: 'ECO109', attendanceDate: new Date('2026-09-13'), status: 'PRESENT', remarks: '' },
  { studentEmail: 'jack.johnson@edu.com', courseCode: 'ART110', attendanceDate: new Date('2026-09-14'), status: 'PRESENT', remarks: '' },
];

const grades = [
  {
    studentEmail: 'alice.johnson@edu.com',
    courseCode: 'CS101',
    score: 88.5,
    gradeLetter: 'B+',
    assessmentType: 'MIDTERM',
  },
  { studentEmail: 'bob.johnson@edu.com', courseCode: 'BUS102', score: 82, gradeLetter: 'B+', assessmentType: 'MIDTERM' },
  { studentEmail: 'carol.johnson@edu.com', courseCode: 'MAT103', score: 91, gradeLetter: 'A-', assessmentType: 'MIDTERM' },
  { studentEmail: 'daniel.johnson@edu.com', courseCode: 'PHY104', score: 78, gradeLetter: 'C+', assessmentType: 'MIDTERM' },
  { studentEmail: 'eva.johnson@edu.com', courseCode: 'ENG105', score: 87, gradeLetter: 'B+', assessmentType: 'MIDTERM' },
  { studentEmail: 'frank.johnson@edu.com', courseCode: 'HIS106', score: 94, gradeLetter: 'A', assessmentType: 'MIDTERM' },
  { studentEmail: 'grace.johnson@edu.com', courseCode: 'BIO107', score: 89, gradeLetter: 'B+', assessmentType: 'MIDTERM' },
  { studentEmail: 'henry.johnson@edu.com', courseCode: 'ENG108', score: 85, gradeLetter: 'B', assessmentType: 'MIDTERM' },
  { studentEmail: 'ivy.johnson@edu.com', courseCode: 'ECO109', score: 92, gradeLetter: 'A-', assessmentType: 'MIDTERM' },
  { studentEmail: 'jack.johnson@edu.com', courseCode: 'ART110', score: 96, gradeLetter: 'A', assessmentType: 'MIDTERM' },
];

const assignments = [
  {
    courseCode: 'CS101',
    teacherEmail: 'john.smith@edu.com',
    title: 'Homework 1',
    description: 'Loops and conditionals',
    dueDate: new Date('2026-09-20'),
    totalPoints: 100,
  },
  { courseCode: 'BUS102', teacherEmail: 'john.brown@edu.com', title: 'Assignment 2', description: 'Business data analysis', dueDate: new Date('2026-09-21'), totalPoints: 100 },
  { courseCode: 'MAT103', teacherEmail: 'emily.stone@edu.com', title: 'Assignment 3', description: 'Calculus exercises', dueDate: new Date('2026-09-22'), totalPoints: 100 },
  { courseCode: 'PHY104', teacherEmail: 'michael.hall@edu.com', title: 'Assignment 4', description: 'Physics lab report', dueDate: new Date('2026-09-23'), totalPoints: 100 },
  { courseCode: 'ENG105', teacherEmail: 'sarah.lee@edu.com', title: 'Assignment 5', description: 'Research essay', dueDate: new Date('2026-09-24'), totalPoints: 100 },
  { courseCode: 'HIS106', teacherEmail: 'david.king@edu.com', title: 'Assignment 6', description: 'History analysis', dueDate: new Date('2026-09-25'), totalPoints: 100 },
  { courseCode: 'BIO107', teacherEmail: 'laura.green@edu.com', title: 'Assignment 7', description: 'Cell biology report', dueDate: new Date('2026-09-26'), totalPoints: 100 },
  { courseCode: 'ENG108', teacherEmail: 'robert.young@edu.com', title: 'Assignment 8', description: 'Design project', dueDate: new Date('2026-09-27'), totalPoints: 100 },
  { courseCode: 'ECO109', teacherEmail: 'lisa.brown@edu.com', title: 'Assignment 9', description: 'Market analysis', dueDate: new Date('2026-09-28'), totalPoints: 100 },
  { courseCode: 'ART110', teacherEmail: 'james.white@edu.com', title: 'Assignment 10', description: 'Digital portfolio', dueDate: new Date('2026-09-29'), totalPoints: 100 },
];

const submissions = [
  {
    assignmentTitle: 'Homework 1',
    courseCode: 'CS101',
    studentEmail: 'alice.johnson@edu.com',
    score: 90,
    feedback: 'Good work',
    filePath: '/uploads/hw1_alice.pdf',
  },
  { assignmentTitle: 'Assignment 2', courseCode: 'BUS102', studentEmail: 'bob.johnson@edu.com', score: 86, feedback: 'Good work', filePath: '/uploads/assignment_2.pdf' },
  { assignmentTitle: 'Assignment 3', courseCode: 'MAT103', studentEmail: 'carol.johnson@edu.com', score: 91, feedback: 'Excellent work', filePath: '/uploads/assignment_3.pdf' },
  { assignmentTitle: 'Assignment 4', courseCode: 'PHY104', studentEmail: 'daniel.johnson@edu.com', score: 79, feedback: 'Needs revision', filePath: '/uploads/assignment_4.pdf' },
  { assignmentTitle: 'Assignment 5', courseCode: 'ENG105', studentEmail: 'eva.johnson@edu.com', score: 88, feedback: 'Well written', filePath: '/uploads/assignment_5.pdf' },
  { assignmentTitle: 'Assignment 6', courseCode: 'HIS106', studentEmail: 'frank.johnson@edu.com', score: 94, feedback: 'Excellent work', filePath: '/uploads/assignment_6.pdf' },
  { assignmentTitle: 'Assignment 7', courseCode: 'BIO107', studentEmail: 'grace.johnson@edu.com', score: 89, feedback: 'Good work', filePath: '/uploads/assignment_7.pdf' },
  { assignmentTitle: 'Assignment 8', courseCode: 'ENG108', studentEmail: 'henry.johnson@edu.com', score: 84, feedback: 'Good work', filePath: '/uploads/assignment_8.pdf' },
  { assignmentTitle: 'Assignment 9', courseCode: 'ECO109', studentEmail: 'ivy.johnson@edu.com', score: 92, feedback: 'Excellent work', filePath: '/uploads/assignment_9.pdf' },
  { assignmentTitle: 'Assignment 10', courseCode: 'ART110', studentEmail: 'jack.johnson@edu.com', score: 96, feedback: 'Outstanding work', filePath: '/uploads/assignment_10.pdf' },
];

export async function seedProgress({ students, courses, teachers }: AcademicSeedContext) {
  const studentByEmail = new Map(students.map((student) => [student.email, student]));
  const courseByCode = new Map(courses.map((course) => [course.courseCode, course]));
  const teacherByEmail = new Map(teachers.map((teacher) => [teacher.email, teacher]));

  await prisma.enrollment.createMany({
    data: enrollments.map(({ studentEmail, courseCode, status }) => ({
      studentId: studentByEmail.get(studentEmail)!.id,
      courseId: courseByCode.get(courseCode)!.id,
      status,
    })),
    skipDuplicates: true,
  });

  for (const record of attendance) {
    const { studentEmail, courseCode, ...attendanceData } = record;
    const studentId = studentByEmail.get(studentEmail)!.id;
    const courseId = courseByCode.get(courseCode)!.id;
    const existing = await prisma.attendance.findFirst({ where: { studentId, courseId, attendanceDate: record.attendanceDate } });
    if (!existing) await prisma.attendance.create({ data: { ...attendanceData, studentId, courseId } });
  }

  for (const record of grades) {
    const studentId = studentByEmail.get(record.studentEmail)!.id;
    const courseId = courseByCode.get(record.courseCode)!.id;
    const existing = await prisma.grade.findFirst({ where: { studentId, courseId, assessmentType: record.assessmentType } });
    if (!existing) await prisma.grade.create({ data: { studentId, courseId, score: record.score, gradeLetter: record.gradeLetter, assessmentType: record.assessmentType } });
  }

  const assignmentByKey = new Map<string, { id: number }>();
  for (const { courseCode, teacherEmail, ...record } of assignments) {
    const courseId = courseByCode.get(courseCode)!.id;
    const teacherId = teacherByEmail.get(teacherEmail)!.id;
    const existing = await prisma.assignment.findFirst({ where: { courseId, title: record.title } });
    const assignment = existing ?? await prisma.assignment.create({ data: { ...record, courseId, teacherId } });
    assignmentByKey.set(`${courseCode}:${record.title}`, assignment);
  }

  await prisma.submission.createMany({
    data: submissions.map(({ assignmentTitle, courseCode, studentEmail, ...record }) => ({
      ...record,
      assignmentId: assignmentByKey.get(`${courseCode}:${assignmentTitle}`)!.id,
      studentId: studentByEmail.get(studentEmail)!.id,
    })),
    skipDuplicates: true,
  });
}
