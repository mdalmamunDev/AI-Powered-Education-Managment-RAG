import { prisma } from './prisma';
import { embed } from '../src/helpers/ollama';

// Idempotent ingest: any existing embedding for (sourceType, sourceId) is
// replaced so re-running `rag-seed` never creates duplicates.
async function ingest(sourceType: string, id: number, text: string) {
  if (!text || !text.trim()) return;
  const vector = await embed(text);
  const vectorLiteral = `[${vector.join(',')}]`;
  await prisma.$transaction([
    prisma.$executeRaw`
      DELETE FROM "Embedding" WHERE "sourceType" = ${sourceType} AND "sourceId" = ${id}
    `,
    prisma.$executeRaw`
      INSERT INTO "Embedding" ("sourceType", "sourceId", "content", "embedding")
      VALUES (${sourceType}, ${id}, ${text}, ${vectorLiteral}::vector)
    `,
  ]);
}

async function main() {
  const courses = await prisma.course.findMany();
  for (const c of courses) {
    await ingest('course', c.id, `${c.courseName} (${c.courseCode}): ${c.description ?? ''}`);
  }

  const assignments = await prisma.assignment.findMany();
  for (const a of assignments) {
    await ingest('assignment', a.id, `${a.title}: ${a.description ?? ''}`);
  }

  const books = await prisma.libraryBook.findMany();
  for (const b of books) {
    await ingest('libraryBook', b.id, `${b.title} by ${b.author}, category: ${b.category ?? ''}`);
  }

  const advisements = await prisma.advisement.findMany({ include: { student: true } });
  for (const a of advisements) {
    const who = a.student ? `${a.student.firstName} ${a.student.lastName}` : `student #${a.studentId}`;
    await ingest('advisement', a.id, `Advisement for ${who} — topic: ${a.topic ?? ''}. Notes: ${a.notes ?? ''}`);
  }

  const submissions = await prisma.submission.findMany();
  for (const s of submissions) {
    await ingest('submission', s.id, `Submission feedback: ${s.feedback ?? ''}, score: ${s.score ?? ''}`);
  }

  const departments = await prisma.department.findMany();
  for (const d of departments) {
    await ingest(
      'department',
      d.id,
      `Department of ${d.departmentName}: head of department ${d.headOfDepartment ?? ''}, located at ${d.location ?? ''}`
    );
  }

  const teachers = await prisma.teacher.findMany();
  for (const t of teachers) {
    await ingest(
      'teacher',
      t.id,
      `Professor ${t.firstName} ${t.lastName} — specialization: ${t.specialization ?? ''}, office: ${t.officeLocation ?? ''}`
    );
  }

  const classrooms = await prisma.classroom.findMany();
  for (const cr of classrooms) {
    await ingest(
      'classroom',
      cr.id,
      `Classroom ${cr.building} ${cr.roomNumber}, capacity ${cr.capacity}, equipment: ${cr.equipment ?? ''}`
    );
  }

  const exams = await prisma.exam.findMany({ include: { course: true } });
  for (const e of exams) {
    const course = e.course ? ` for ${e.course.courseName}` : '';
    await ingest('exam', e.id, `${e.examType} exam${course}, location: ${e.location ?? ''}, total marks: ${e.totalMarks}`);
  }

  const officeHours = await prisma.officeHours.findMany({ include: { teacher: true } });
  for (const o of officeHours) {
    const who = o.teacher ? `${o.teacher.firstName} ${o.teacher.lastName}` : `teacher #${o.teacherId}`;
    await ingest(
      'officeHours',
      o.id,
      `Office hours — ${who}: ${o.dayOfWeek} ${o.startTime} to ${o.endTime} at ${o.location ?? ''}`
    );
  }

  console.log('Embedding ingestion complete.');
}

main().finally(() => prisma.$disconnect());