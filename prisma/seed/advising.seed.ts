import { prisma } from '../prisma';
import { AcademicSeedContext } from './types';

const guardians = [
  { firstName: 'Abdur', lastName: 'Rahman', relationship: 'Father', email: 'robert.johnson@example.com', phone: '555-0103', occupation: 'Engineer' },
  { firstName: 'Shirin', lastName: 'Akter', relationship: 'Mother', email: 'maria.johnson@example.com', phone: '555-0104', occupation: 'Teacher' },
  { firstName: 'Kamal', lastName: 'Ahmed', relationship: 'Father', email: 'thomas.johnson@example.com', phone: '555-0105', occupation: 'Manager' },
  { firstName: 'Nasrin', lastName: 'Begum', relationship: 'Mother', email: 'linda.johnson@example.com', phone: '555-0106', occupation: 'Nurse' },
  { firstName: 'Mizanur', lastName: 'Rahman', relationship: 'Father', email: 'william.johnson@example.com', phone: '555-0107', occupation: 'Engineer' },
  { firstName: 'Parvin', lastName: 'Sultana', relationship: 'Mother', email: 'patricia.johnson@example.com', phone: '555-0108', occupation: 'Accountant' },
  { firstName: 'Selim', lastName: 'Khan', relationship: 'Father', email: 'charles.johnson@example.com', phone: '555-0109', occupation: 'Architect' },
  { firstName: 'Shahana', lastName: 'Islam', relationship: 'Mother', email: 'barbara.johnson@example.com', phone: '555-0110', occupation: 'Designer' },
  { firstName: 'Jahangir', lastName: 'Hossain', relationship: 'Father', email: 'joseph.johnson@example.com', phone: '555-0111', occupation: 'Lawyer' },
  { firstName: 'Rumana', lastName: 'Jahan', relationship: 'Mother', email: 'jennifer.johnson@example.com', phone: '555-0112', occupation: 'Consultant' },
];

const guardianLinks = [
  { studentEmail: 'alice.johnson@edu.com', guardianEmail: 'robert.johnson@example.com' },
  { studentEmail: 'bob.johnson@edu.com', guardianEmail: 'maria.johnson@example.com' },
  { studentEmail: 'carol.johnson@edu.com', guardianEmail: 'thomas.johnson@example.com' },
  { studentEmail: 'daniel.johnson@edu.com', guardianEmail: 'linda.johnson@example.com' },
  { studentEmail: 'eva.johnson@edu.com', guardianEmail: 'william.johnson@example.com' },
  { studentEmail: 'frank.johnson@edu.com', guardianEmail: 'patricia.johnson@example.com' },
  { studentEmail: 'grace.johnson@edu.com', guardianEmail: 'charles.johnson@example.com' },
  { studentEmail: 'henry.johnson@edu.com', guardianEmail: 'barbara.johnson@example.com' },
  { studentEmail: 'ivy.johnson@edu.com', guardianEmail: 'joseph.johnson@example.com' },
  { studentEmail: 'jack.johnson@edu.com', guardianEmail: 'jennifer.johnson@example.com' },
];

const officeHours = [
  { teacherEmail: 'john.smith@edu.com', dayOfWeek: 'TUESDAY', startTime: '13:00:00.000Z', endTime: '15:00:00.000Z', location: 'Room 204' },
  { teacherEmail: 'john.brown@edu.com', dayOfWeek: 'MONDAY', startTime: '13:00:00.000Z', endTime: '15:00:00.000Z', location: 'Room 205' },
  { teacherEmail: 'emily.stone@edu.com', dayOfWeek: 'TUESDAY', startTime: '13:00:00.000Z', endTime: '15:00:00.000Z', location: 'Room 206' },
  { teacherEmail: 'michael.hall@edu.com', dayOfWeek: 'WEDNESDAY', startTime: '13:00:00.000Z', endTime: '15:00:00.000Z', location: 'Room 207' },
  { teacherEmail: 'sarah.lee@edu.com', dayOfWeek: 'THURSDAY', startTime: '13:00:00.000Z', endTime: '15:00:00.000Z', location: 'Room 208' },
  { teacherEmail: 'david.king@edu.com', dayOfWeek: 'FRIDAY', startTime: '13:00:00.000Z', endTime: '15:00:00.000Z', location: 'Room 209' },
  { teacherEmail: 'laura.green@edu.com', dayOfWeek: 'MONDAY', startTime: '15:00:00.000Z', endTime: '17:00:00.000Z', location: 'Room 210' },
  { teacherEmail: 'robert.young@edu.com', dayOfWeek: 'TUESDAY', startTime: '15:00:00.000Z', endTime: '17:00:00.000Z', location: 'Room 211' },
  { teacherEmail: 'lisa.brown@edu.com', dayOfWeek: 'WEDNESDAY', startTime: '15:00:00.000Z', endTime: '17:00:00.000Z', location: 'Room 212' },
  { teacherEmail: 'james.white@edu.com', dayOfWeek: 'THURSDAY', startTime: '15:00:00.000Z', endTime: '17:00:00.000Z', location: 'Room 213' },
];

const advisements = [
  { studentEmail: 'alice.johnson@edu.com', teacherEmail: 'john.smith@edu.com', meetingDate: new Date('2026-09-10'), topic: 'Course planning', notes: 'Discussed electives' },
  { studentEmail: 'bob.johnson@edu.com', teacherEmail: 'john.brown@edu.com', meetingDate: new Date('2026-09-11'), topic: 'Business planning', notes: 'Discussed electives' },
  { studentEmail: 'carol.johnson@edu.com', teacherEmail: 'emily.stone@edu.com', meetingDate: new Date('2026-09-12'), topic: 'Mathematics planning', notes: 'Discussed electives' },
  { studentEmail: 'daniel.johnson@edu.com', teacherEmail: 'michael.hall@edu.com', meetingDate: new Date('2026-09-13'), topic: 'Physics planning', notes: 'Discussed electives' },
  { studentEmail: 'eva.johnson@edu.com', teacherEmail: 'sarah.lee@edu.com', meetingDate: new Date('2026-09-14'), topic: 'Writing planning', notes: 'Discussed electives' },
  { studentEmail: 'frank.johnson@edu.com', teacherEmail: 'david.king@edu.com', meetingDate: new Date('2026-09-15'), topic: 'History planning', notes: 'Discussed electives' },
  { studentEmail: 'grace.johnson@edu.com', teacherEmail: 'laura.green@edu.com', meetingDate: new Date('2026-09-16'), topic: 'Biology planning', notes: 'Discussed electives' },
  { studentEmail: 'henry.johnson@edu.com', teacherEmail: 'robert.young@edu.com', meetingDate: new Date('2026-09-17'), topic: 'Engineering planning', notes: 'Discussed electives' },
  { studentEmail: 'ivy.johnson@edu.com', teacherEmail: 'lisa.brown@edu.com', meetingDate: new Date('2026-09-18'), topic: 'Economics planning', notes: 'Discussed electives' },
  { studentEmail: 'jack.johnson@edu.com', teacherEmail: 'james.white@edu.com', meetingDate: new Date('2026-09-19'), topic: 'Arts planning', notes: 'Discussed electives' },
];

export async function seedAdvising({ students, teachers }: AcademicSeedContext) {
  const guardianRecords = await Promise.all(
    guardians.map(async (guardian) => {
      const existing = await prisma.parentGuardian.findFirst({ where: { email: guardian.email } });
      return existing ?? prisma.parentGuardian.create({ data: guardian });
    }),
  );
  const guardianByEmail = new Map(guardianRecords.map((guardian) => [guardian.email, guardian]));
  const studentByEmail = new Map(students.map((student) => [student.email, student]));
  const teacherByEmail = new Map(teachers.map((teacher) => [teacher.email, teacher]));

  await prisma.studentGuardian.createMany({
    data: guardianLinks.map(({ studentEmail, guardianEmail }) => ({ studentId: studentByEmail.get(studentEmail)!.id, guardianId: guardianByEmail.get(guardianEmail)!.id })),
    skipDuplicates: true,
  });

  for (const { teacherEmail, startTime, endTime, ...record } of officeHours) {
    const teacherId = teacherByEmail.get(teacherEmail)!.id;
    const existing = await prisma.officeHours.findFirst({ where: { teacherId, dayOfWeek: record.dayOfWeek } });
    if (!existing) await prisma.officeHours.create({ data: { ...record, teacherId, startTime: new Date(`1970-01-01T${startTime}`), endTime: new Date(`1970-01-01T${endTime}`) } });
  }

  for (const { studentEmail, teacherEmail, ...record } of advisements) {
    const studentId = studentByEmail.get(studentEmail)!.id;
    const teacherId = teacherByEmail.get(teacherEmail)!.id;
    const existing = await prisma.advisement.findFirst({ where: { studentId, teacherId, topic: record.topic } });
    if (!existing) await prisma.advisement.create({ data: { ...record, studentId, teacherId } });
  }

  return guardianRecords;
}
