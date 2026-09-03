import { prisma } from '../prisma';
import { AcademicSeedContext } from './types';

const classrooms = [
  { building: 'Building A', roomNumber: '101', capacity: 50, equipment: 'Projector, Whiteboard' },
  { building: 'Building B', roomNumber: '102', capacity: 45, equipment: 'Projector' },
  { building: 'Building C', roomNumber: '103', capacity: 40, equipment: 'Whiteboard' },
  { building: 'Building D', roomNumber: '104', capacity: 50, equipment: 'Projector, Lab Tables' },
  { building: 'Building E', roomNumber: '105', capacity: 35, equipment: 'Smart Board' },
  { building: 'Building F', roomNumber: '106', capacity: 40, equipment: 'Projector' },
  { building: 'Building G', roomNumber: '107', capacity: 30, equipment: 'Lab Equipment' },
  { building: 'Building H', roomNumber: '108', capacity: 35, equipment: 'Workshop Tools' },
  { building: 'Building I', roomNumber: '109', capacity: 45, equipment: 'Projector, Whiteboard' },
  { building: 'Building J', roomNumber: '110', capacity: 25, equipment: 'Art Tables' },
];

const schedules = [
  { courseCode: 'CS101', classroomKey: 'Building A:101', dayOfWeek: 'MONDAY', startTime: '09:00:00.000Z', endTime: '10:30:00.000Z', semester: 'Fall 2026' },
  { courseCode: 'BUS102', classroomKey: 'Building B:102', dayOfWeek: 'TUESDAY', startTime: '09:00:00.000Z', endTime: '10:30:00.000Z', semester: 'Fall 2026' },
  { courseCode: 'MAT103', classroomKey: 'Building C:103', dayOfWeek: 'WEDNESDAY', startTime: '09:00:00.000Z', endTime: '10:30:00.000Z', semester: 'Fall 2026' },
  { courseCode: 'PHY104', classroomKey: 'Building D:104', dayOfWeek: 'THURSDAY', startTime: '09:00:00.000Z', endTime: '10:30:00.000Z', semester: 'Fall 2026' },
  { courseCode: 'ENG105', classroomKey: 'Building E:105', dayOfWeek: 'FRIDAY', startTime: '09:00:00.000Z', endTime: '10:30:00.000Z', semester: 'Fall 2026' },
  { courseCode: 'HIS106', classroomKey: 'Building F:106', dayOfWeek: 'MONDAY', startTime: '11:00:00.000Z', endTime: '12:30:00.000Z', semester: 'Fall 2026' },
  { courseCode: 'BIO107', classroomKey: 'Building G:107', dayOfWeek: 'TUESDAY', startTime: '11:00:00.000Z', endTime: '12:30:00.000Z', semester: 'Fall 2026' },
  { courseCode: 'ENG108', classroomKey: 'Building H:108', dayOfWeek: 'WEDNESDAY', startTime: '11:00:00.000Z', endTime: '12:30:00.000Z', semester: 'Fall 2026' },
  { courseCode: 'ECO109', classroomKey: 'Building I:109', dayOfWeek: 'THURSDAY', startTime: '11:00:00.000Z', endTime: '12:30:00.000Z', semester: 'Fall 2026' },
  { courseCode: 'ART110', classroomKey: 'Building J:110', dayOfWeek: 'FRIDAY', startTime: '11:00:00.000Z', endTime: '12:30:00.000Z', semester: 'Fall 2026' },
];

const exams = [
  { courseCode: 'CS101', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall A', totalMarks: 100 },
  { courseCode: 'BUS102', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall B', totalMarks: 100 },
  { courseCode: 'MAT103', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall C', totalMarks: 100 },
  { courseCode: 'PHY104', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall D', totalMarks: 100 },
  { courseCode: 'ENG105', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall E', totalMarks: 100 },
  { courseCode: 'HIS106', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall F', totalMarks: 100 },
  { courseCode: 'BIO107', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall G', totalMarks: 100 },
  { courseCode: 'ENG108', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall H', totalMarks: 100 },
  { courseCode: 'ECO109', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall I', totalMarks: 100 },
  { courseCode: 'ART110', examType: 'FINAL', examDate: new Date('2026-12-15'), duration: '02:00:00.000Z', location: 'Hall J', totalMarks: 100 },
];

const payments = [
  { studentEmail: 'alice.johnson@edu.com', amount: '500.00', paymentMethod: 'CARD', semester: 'Fall 2026', status: 'PAID' },
  { studentEmail: 'bob.johnson@edu.com', amount: '525.00', paymentMethod: 'CASH', semester: 'Fall 2026', status: 'PAID' },
  { studentEmail: 'carol.johnson@edu.com', amount: '550.00', paymentMethod: 'CARD', semester: 'Fall 2026', status: 'PAID' },
  { studentEmail: 'daniel.johnson@edu.com', amount: '575.00', paymentMethod: 'TRANSFER', semester: 'Fall 2026', status: 'PAID' },
  { studentEmail: 'eva.johnson@edu.com', amount: '600.00', paymentMethod: 'CARD', semester: 'Fall 2026', status: 'PAID' },
  { studentEmail: 'frank.johnson@edu.com', amount: '625.00', paymentMethod: 'CASH', semester: 'Fall 2026', status: 'PAID' },
  { studentEmail: 'grace.johnson@edu.com', amount: '650.00', paymentMethod: 'CARD', semester: 'Fall 2026', status: 'PAID' },
  { studentEmail: 'henry.johnson@edu.com', amount: '675.00', paymentMethod: 'TRANSFER', semester: 'Fall 2026', status: 'PAID' },
  { studentEmail: 'ivy.johnson@edu.com', amount: '700.00', paymentMethod: 'CARD', semester: 'Fall 2026', status: 'PAID' },
  { studentEmail: 'jack.johnson@edu.com', amount: '725.00', paymentMethod: 'CASH', semester: 'Fall 2026', status: 'PAID' },
];

export async function seedOperations({ students, courses }: AcademicSeedContext) {
  const classroomRecords = await Promise.all(
    classrooms.map((classroom) => prisma.classroom.upsert({ where: { building_roomNumber: { building: classroom.building, roomNumber: classroom.roomNumber } }, update: {}, create: classroom })),
  );
  const classroomByKey = new Map(classroomRecords.map((classroom) => [`${classroom.building}:${classroom.roomNumber}`, classroom]));
  const courseByCode = new Map(courses.map((course) => [course.courseCode, course]));
  const studentByEmail = new Map(students.map((student) => [student.email, student]));

  for (const { courseCode, classroomKey, startTime, endTime, ...record } of schedules) {
    const courseId = courseByCode.get(courseCode)!.id;
    const classroomId = classroomByKey.get(classroomKey)!.id;
    const existing = await prisma.schedule.findFirst({ where: { courseId, classroomId, dayOfWeek: record.dayOfWeek } });
    if (!existing) await prisma.schedule.create({ data: { ...record, courseId, classroomId, startTime: new Date(`1970-01-01T${startTime}`), endTime: new Date(`1970-01-01T${endTime}`) } });
  }

  for (const { courseCode, duration, ...record } of exams) {
    const courseId = courseByCode.get(courseCode)!.id;
    const existing = await prisma.exam.findFirst({ where: { courseId, examType: record.examType } });
    if (!existing) await prisma.exam.create({ data: { ...record, courseId, duration: new Date(`1970-01-01T${duration}`) } });
  }

  for (const { studentEmail, ...record } of payments) {
    const studentId = studentByEmail.get(studentEmail)!.id;
    const existing = await prisma.payment.findFirst({ where: { studentId, semester: record.semester } });
    if (!existing) await prisma.payment.create({ data: { ...record, studentId } });
  }
}
