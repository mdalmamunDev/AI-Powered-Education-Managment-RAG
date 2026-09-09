// ─────────────────────────────────────────────────────────────
// catalog.ts — the allow-list that defines everything the
// NL query engine may touch. The LLM never writes SQL or Prisma
// args directly; it picks targets / fields / ops from here, and
// the compiler validates every choice against this list.
// ─────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'number' | 'date';
export type FieldOp = 'eq' | 'neq' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';

export interface RelationInfo {
  model: string;
  fkField: string;
  displayField: string;
}

export interface CatalogField {
  path: string;
  type: FieldType;
  ops: FieldOp[];
  label: string;
  relation?: RelationInfo;
}

export interface CatalogTarget {
  model: string;
  name: string;
  aliases: string[];
  fields: CatalogField[];
  groupable: string[];
  aggregatable: string[];
}
export const CATALOG: CatalogTarget[] = [
  {
    model: 'department',
    name: 'Department',
    aliases: ['departments', 'dept', 'depts'],
    fields: [
      { path: 'departmentName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'department name' },
      { path: 'headOfDepartment', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'head of department' },
      { path: 'location', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'location' },
      { path: 'phone', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'phone' },
    ],
    groupable: ['departmentName', 'location'],
    aggregatable: [],
  },
  {
    model: 'semester',
    name: 'Semester',
    aliases: ['semesters', 'term', 'terms'],
    fields: [
      { path: 'semesterName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'semester name' },
      { path: 'academicYear', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'academic year' },
      { path: 'startDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'start date' },
      { path: 'endDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'end date' },
    ],
    groupable: ['semesterName', 'academicYear'],
    aggregatable: [],
  },
  {
    model: 'teacher',
    name: 'Teacher',
    aliases: ['teachers', 'professor', 'professors', 'faculty', 'instructor', 'instructors'],
    fields: [
      { path: 'firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'first name' },
      { path: 'lastName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'last name' },
      { path: 'email', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'email' },
      { path: 'specialization', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'specialization' },
      { path: 'hireDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'hire date' },
      { path: 'officeLocation', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'office location' },
      { path: 'departmentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'department id', relation: { model: 'department', fkField: 'departmentId', displayField: 'departmentName' } },
      { path: 'department.departmentName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'department name', relation: { model: 'department', fkField: 'departmentId', displayField: 'departmentName' } },
    ],
    groupable: ['departmentId', 'specialization'],
    aggregatable: [],
  },
  {
    model: 'student',
    name: 'Student',
    aliases: ['students', 'pupil', 'pupils', 'learner', 'learners'],
    fields: [
      { path: 'firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'first name' },
      { path: 'lastName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'last name' },
      { path: 'email', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'email' },
      { path: 'status', type: 'text', ops: ['eq', 'neq', 'in'], label: 'status' },
      { path: 'enrollmentDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'enrollment date' },
      { path: 'dateOfBirth', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'date of birth' },
      { path: 'departmentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'department id', relation: { model: 'department', fkField: 'departmentId', displayField: 'departmentName' } },
      { path: 'department.departmentName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'department name', relation: { model: 'department', fkField: 'departmentId', displayField: 'departmentName' } },
    ],
    groupable: ['status', 'departmentId'],
    aggregatable: [],
  },
  {
    model: 'course',
    name: 'Course',
    aliases: ['courses', 'class', 'classes', 'subject', 'subjects'],
    fields: [
      { path: 'courseName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'course name' },
      { path: 'courseCode', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'course code' },
      { path: 'creditHours', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'credit hours' },
      { path: 'maxCapacity', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'max capacity' },
      { path: 'departmentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'department id', relation: { model: 'department', fkField: 'departmentId', displayField: 'departmentName' } },
      { path: 'department.departmentName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'department name', relation: { model: 'department', fkField: 'departmentId', displayField: 'departmentName' } },
      { path: 'semesterId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'semester id', relation: { model: 'semester', fkField: 'semesterId', displayField: 'semesterName' } },
      { path: 'semester.semesterName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'semester name', relation: { model: 'semester', fkField: 'semesterId', displayField: 'semesterName' } },
    ],
    groupable: ['departmentId', 'semesterId', 'creditHours'],
    aggregatable: ['creditHours', 'maxCapacity'],
  },
  {
    model: 'enrollment',
    name: 'Enrollment',
    aliases: ['enrollments', 'registration', 'registrations'],
    fields: [
      { path: 'enrollmentDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'enrollment date' },
      { path: 'status', type: 'text', ops: ['eq', 'neq', 'in'], label: 'status' },
      { path: 'studentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'student id', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
      { path: 'student.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'student first name', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
      { path: 'student.lastName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'student last name', relation: { model: 'student', fkField: 'studentId', displayField: 'lastName' } },
      { path: 'student.email', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'student email', relation: { model: 'student', fkField: 'studentId', displayField: 'email' } },
      { path: 'courseId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'course id', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'course.courseName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'course name', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'course.courseCode', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'course code', relation: { model: 'course', fkField: 'courseId', displayField: 'courseCode' } },
    ],
    groupable: ['status', 'courseId', 'studentId'],
    aggregatable: [],
  },
  {
    model: 'attendance',
    name: 'Attendance',
    aliases: ['attendances'],
    fields: [
      { path: 'attendanceDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'attendance date' },
      { path: 'status', type: 'text', ops: ['eq', 'neq', 'in'], label: 'status' },
      { path: 'courseId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'course id', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'course.courseName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'course name', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'studentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'student id', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
      { path: 'student.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'student first name', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
    ],
    groupable: ['status', 'courseId', 'studentId'],
    aggregatable: [],
  },
  {
    model: 'grade',
    name: 'Grade',
    aliases: ['grades', 'score', 'scores', 'mark', 'marks'],
    fields: [
      { path: 'score', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'score' },
      { path: 'gradeLetter', type: 'text', ops: ['eq', 'neq', 'in'], label: 'grade letter' },
      { path: 'assessmentType', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'assessment type' },
      { path: 'courseId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'course id', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'course.courseName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'course name', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'studentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'student id', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
      { path: 'student.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'student first name', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
    ],
    groupable: ['gradeLetter', 'assessmentType', 'courseId', 'studentId'],
    aggregatable: ['score'],
  },
  {
    model: 'assignment',
    name: 'Assignment',
    aliases: ['assignments', 'homework', 'task', 'tasks'],
    fields: [
      { path: 'title', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'title' },
      { path: 'dueDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'due date' },
      { path: 'totalPoints', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'total points' },
      { path: 'courseId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'course id', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'course.courseName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'course name', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'teacherId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'teacher id', relation: { model: 'teacher', fkField: 'teacherId', displayField: 'firstName' } },
      { path: 'teacher.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'teacher first name', relation: { model: 'teacher', fkField: 'teacherId', displayField: 'firstName' } },
    ],
    groupable: ['courseId', 'teacherId'],
    aggregatable: ['totalPoints'],
  },
  {
    model: 'submission',
    name: 'Submission',
    aliases: ['submissions'],
    fields: [
      { path: 'submissionDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'submission date' },
      { path: 'score', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'score' },
      { path: 'assignmentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'assignment id', relation: { model: 'assignment', fkField: 'assignmentId', displayField: 'title' } },
      { path: 'assignment.title', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'assignment title', relation: { model: 'assignment', fkField: 'assignmentId', displayField: 'title' } },
      { path: 'studentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'student id', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
      { path: 'student.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'student first name', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
    ],
    groupable: ['assignmentId', 'studentId'],
    aggregatable: ['score'],
  },
  {
    model: 'payment',
    name: 'Payment',
    aliases: ['payments', 'fee', 'fees', 'tuition'],
    fields: [
      { path: 'amount', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'amount' },
      { path: 'paymentDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'payment date' },
      { path: 'paymentMethod', type: 'text', ops: ['eq', 'neq', 'in'], label: 'payment method' },
      { path: 'semester', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'semester' },
      { path: 'status', type: 'text', ops: ['eq', 'neq', 'in'], label: 'status' },
      { path: 'studentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'student id', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
      { path: 'student.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'student first name', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
    ],
    groupable: ['paymentMethod', 'semester', 'status', 'studentId'],
    aggregatable: ['amount'],
  },
  {
    model: 'classroom',
    name: 'Classroom',
    aliases: ['classrooms', 'room', 'rooms'],
    fields: [
      { path: 'building', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'building' },
      { path: 'roomNumber', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'room number' },
      { path: 'capacity', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'capacity' },
      { path: 'equipment', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'equipment' },
    ],
    groupable: ['building'],
    aggregatable: ['capacity'],
  },
  {
    model: 'schedule',
    name: 'Schedule',
    aliases: ['schedules', 'timetable', 'timetables'],
    fields: [
      { path: 'dayOfWeek', type: 'text', ops: ['eq', 'neq', 'in'], label: 'day of week' },
      { path: 'semester', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'semester' },
      { path: 'courseId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'course id', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'course.courseName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'course name', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'classroomId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'classroom id', relation: { model: 'classroom', fkField: 'classroomId', displayField: 'roomNumber' } },
      { path: 'classroom.roomNumber', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'room number', relation: { model: 'classroom', fkField: 'classroomId', displayField: 'roomNumber' } },
    ],
    groupable: ['dayOfWeek', 'semester', 'courseId', 'classroomId'],
    aggregatable: [],
  },
  {
    model: 'exam',
    name: 'Exam',
    aliases: ['exams', 'examination', 'examinations', 'test', 'tests'],
    fields: [
      { path: 'examType', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'exam type' },
      { path: 'examDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'exam date' },
      { path: 'totalMarks', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'total marks' },
      { path: 'location', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'location' },
      { path: 'courseId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'course id', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
      { path: 'course.courseName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'course name', relation: { model: 'course', fkField: 'courseId', displayField: 'courseName' } },
    ],
    groupable: ['examType', 'courseId'],
    aggregatable: ['totalMarks'],
  },
  {
    model: 'parentGuardian',
    name: 'Parent/Guardian',
    aliases: ['guardian', 'guardians', 'parent', 'parents'],
    fields: [
      { path: 'firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'first name' },
      { path: 'lastName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'last name' },
      { path: 'relationship', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'relationship' },
      { path: 'email', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'email' },
      { path: 'phone', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'phone' },
      { path: 'occupation', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'occupation' },
    ],
    groupable: ['relationship'],
    aggregatable: [],
  },
  {
    model: 'officeHours',
    name: 'Office Hours',
    aliases: ['office hour'],
    fields: [
      { path: 'dayOfWeek', type: 'text', ops: ['eq', 'neq', 'in'], label: 'day of week' },
      { path: 'location', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'location' },
      { path: 'teacherId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'teacher id', relation: { model: 'teacher', fkField: 'teacherId', displayField: 'firstName' } },
      { path: 'teacher.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'teacher first name', relation: { model: 'teacher', fkField: 'teacherId', displayField: 'firstName' } },
      { path: 'teacher.lastName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'teacher last name', relation: { model: 'teacher', fkField: 'teacherId', displayField: 'lastName' } },
    ],
    groupable: ['dayOfWeek', 'teacherId'],
    aggregatable: [],
  },
  {
    model: 'advisement',
    name: 'Advisement',
    aliases: ['advisements', 'advising', 'advice session'],
    fields: [
      { path: 'meetingDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'meeting date' },
      { path: 'topic', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'topic' },
      { path: 'studentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'student id', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
      { path: 'student.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'student first name', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
      { path: 'teacherId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'teacher id', relation: { model: 'teacher', fkField: 'teacherId', displayField: 'firstName' } },
      { path: 'teacher.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'teacher first name', relation: { model: 'teacher', fkField: 'teacherId', displayField: 'firstName' } },
    ],
    groupable: ['teacherId', 'studentId'],
    aggregatable: [],
  },
  {
    model: 'libraryBook',
    name: 'Library Book',
    aliases: ['book', 'books', 'library book', 'library books'],
    fields: [
      { path: 'title', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'title' },
      { path: 'author', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'author' },
      { path: 'publisher', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'publisher' },
      { path: 'publicationYear', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'publication year' },
      { path: 'category', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'category' },
      { path: 'copiesAvailable', type: 'number', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'copies available' },
    ],
    groupable: ['category', 'author'],
    aggregatable: ['copiesAvailable', 'publicationYear'],
  },
  {
    model: 'bookLoan',
    name: 'Book Loan',
    aliases: ['loan', 'loans', 'book loan', 'book loans', 'borrowed'],
    fields: [
      { path: 'checkoutDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'checkout date' },
      { path: 'dueDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'due date' },
      { path: 'returnDate', type: 'date', ops: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'], label: 'return date' },
      { path: 'status', type: 'text', ops: ['eq', 'neq', 'in'], label: 'status' },
      { path: 'bookId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'book id', relation: { model: 'libraryBook', fkField: 'bookId', displayField: 'title' } },
      { path: 'book.title', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'book title', relation: { model: 'libraryBook', fkField: 'bookId', displayField: 'title' } },
      { path: 'studentId', type: 'number', ops: ['eq', 'neq', 'in'], label: 'student id', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
      { path: 'student.firstName', type: 'text', ops: ['eq', 'neq', 'contains', 'in'], label: 'student first name', relation: { model: 'student', fkField: 'studentId', displayField: 'firstName' } },
    ],
    groupable: ['status', 'bookId', 'studentId'],
    aggregatable: [],
  },
];

// ── Lookups ──────────────────────────────────────────────────

const TARGET_BY_KEY: Map<string, CatalogTarget> = new Map();
for (const target of CATALOG) {
  TARGET_BY_KEY.set(target.model.toLowerCase(), target);
  TARGET_BY_KEY.set(target.name.toLowerCase(), target);
  for (const alias of target.aliases) TARGET_BY_KEY.set(alias.toLowerCase(), target);
}

export function findTarget(key: string): CatalogTarget | undefined {
  return TARGET_BY_KEY.get(key.toLowerCase());
}

export function findField(target: CatalogTarget, fieldKey: string): CatalogField | undefined {
  const lower = fieldKey.toLowerCase();
  return target.fields.find((f) => f.path.toLowerCase() === lower || f.label.toLowerCase() === lower);
}

