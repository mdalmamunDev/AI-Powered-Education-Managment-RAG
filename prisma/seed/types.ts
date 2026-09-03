import {
  Course,
  Department,
  LibraryBook,
  ParentGuardian,
  Semester,
  Student,
  Teacher,
  User,
} from '@prisma/client';

export type AcademicSeedContext = {
  departments: Department[];
  semesters: Semester[];
  teachers: Teacher[];
  students: Student[];
  courses: Course[];
};

export type SeedContext = AcademicSeedContext & {
  users: User[];
  guardians: ParentGuardian[];
  books: LibraryBook[];
};
