// Single source of truth for turning a just-created/updated record into the
// searchable text that gets embedded. Kept in sync with prisma/embed-seed.ts.
// Only fields that are natural language / identity get embedded — no PII.

export function embeddableContent(sourceType: string, r: any): string {
  switch (sourceType) {
    case 'course':
      return `${r.courseName ?? ''} (${r.courseCode ?? ''}): ${r.description ?? ''}`;
    case 'assignment':
      return `${r.title ?? ''}: ${r.description ?? ''}`;
    case 'libraryBook':
      return `${r.title ?? ''} by ${r.author ?? ''}, category: ${r.category ?? ''}`;
    case 'advisement': {
      const who = r.student ? ` for ${r.student.firstName ?? ''} ${r.student.lastName ?? ''}` : '';
      return `Advisement${who} — topic: ${r.topic ?? ''}. Notes: ${r.notes ?? ''}`;
    }
    case 'submission':
      return `Submission feedback: ${r.feedback ?? ''}, score: ${r.score ?? ''}`;
    case 'department':
      return `Department of ${r.departmentName ?? ''}: head of department ${r.headOfDepartment ?? ''}, located at ${r.location ?? ''}`;
    case 'teacher':
      return `Professor ${r.firstName ?? ''} ${r.lastName ?? ''} — specialization: ${r.specialization ?? ''}, office: ${r.officeLocation ?? ''}`;
    case 'classroom':
      return `Classroom ${r.building ?? ''} ${r.roomNumber ?? ''}, capacity ${r.capacity ?? ''}, equipment: ${r.equipment ?? ''}`;
    case 'exam': {
      const course = r.course?.courseName ? ` for ${r.course.courseName}` : '';
      return `${r.examType ?? ''} exam${course}, location: ${r.location ?? ''}, total marks: ${r.totalMarks ?? ''}`;
    }
    case 'officeHours': {
      const who = r.teacher
        ? `${r.teacher.firstName ?? ''} ${r.teacher.lastName ?? ''}`.trim()
        : `teacher #${r.teacherId}`;
      return `Office hours — ${who}: ${r.dayOfWeek ?? ''} ${r.startTime ?? ''} to ${r.endTime ?? ''} at ${r.location ?? ''}`;
    }
    default:
      return '';
  }
}