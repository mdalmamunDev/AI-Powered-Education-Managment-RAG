import { prisma } from '../prisma';
import { AcademicSeedContext } from './types';

const departments = [
  { departmentName: 'Computer Science', headOfDepartment: 'Dr. Farhana Rahman', location: 'Building A', phone: '555-0100' },
  { departmentName: 'Business', headOfDepartment: 'Dr. Tanvir Ahmed', location: 'Building B', phone: '555-0101' },
  { departmentName: 'Mathematics', headOfDepartment: 'Dr. Nusrat Jahan', location: 'Building C', phone: '555-0102' },
  { departmentName: 'Physics', headOfDepartment: 'Dr. Mahmud Hasan', location: 'Building D', phone: '555-0103' },
  { departmentName: 'English', headOfDepartment: 'Dr. Sadia Islam', location: 'Building E', phone: '555-0104' },
  { departmentName: 'History', headOfDepartment: 'Dr. Arif Hossain', location: 'Building F', phone: '555-0105' },
  { departmentName: 'Biology', headOfDepartment: 'Dr. Roksana Begum', location: 'Building G', phone: '555-0106' },
  { departmentName: 'Engineering', headOfDepartment: 'Dr. Imran Chowdhury', location: 'Building H', phone: '555-0107' },
  { departmentName: 'Economics', headOfDepartment: 'Dr. Mitu Sultana', location: 'Building I', phone: '555-0108' },
  { departmentName: 'Fine Arts', headOfDepartment: 'Dr. Kamal Uddin', location: 'Building J', phone: '555-0109' },
];

const semesters = [
  { semesterName: 'Fall', academicYear: '2026-2027', startDate: new Date('2026-09-01'), endDate: new Date('2026-12-20') },
  { semesterName: 'Spring', academicYear: '2024-2025', startDate: new Date('2025-01-15'), endDate: new Date('2025-05-10') },
  { semesterName: 'Fall', academicYear: '2024-2025', startDate: new Date('2024-09-01'), endDate: new Date('2024-12-20') },
  { semesterName: 'Spring', academicYear: '2025-2026', startDate: new Date('2026-01-15'), endDate: new Date('2026-05-10') },
  { semesterName: 'Fall', academicYear: '2025-2026', startDate: new Date('2025-09-01'), endDate: new Date('2025-12-20') },
  { semesterName: 'Spring', academicYear: '2026-2027', startDate: new Date('2027-01-15'), endDate: new Date('2027-05-10') },
  { semesterName: 'Spring', academicYear: '2027-2028', startDate: new Date('2028-01-15'), endDate: new Date('2028-05-10') },
  { semesterName: 'Fall', academicYear: '2027-2028', startDate: new Date('2027-09-01'), endDate: new Date('2027-12-20') },
  { semesterName: 'Spring', academicYear: '2028-2029', startDate: new Date('2029-01-15'), endDate: new Date('2029-05-10') },
  { semesterName: 'Fall', academicYear: '2028-2029', startDate: new Date('2028-09-01'), endDate: new Date('2028-12-20') },
];

const teachers = [
  {
    firstName: 'Sakib', lastName: 'Rahman', email: 'john.smith@edu.com', phone: '555-0101', hireDate: new Date('2024-08-01'), specialization: 'Algorithms', officeLocation: 'Room 204', departmentName: 'Computer Science'
  },
  { firstName: 'Tanvir', lastName: 'Ahmed', email: 'john.brown@edu.com', phone: '555-0111', hireDate: new Date('2023-08-01'), specialization: 'Management', officeLocation: 'Room 205', departmentName: 'Business' },
  { firstName: 'Nusrat', lastName: 'Jahan', email: 'emily.stone@edu.com', phone: '555-0112', hireDate: new Date('2022-08-01'), specialization: 'Calculus', officeLocation: 'Room 206', departmentName: 'Mathematics' },
  { firstName: 'Mahmud', lastName: 'Hasan', email: 'michael.hall@edu.com', phone: '555-0113', hireDate: new Date('2021-08-01'), specialization: 'Mechanics', officeLocation: 'Room 207', departmentName: 'Physics' },
  { firstName: 'Sadia', lastName: 'Islam', email: 'sarah.lee@edu.com', phone: '555-0114', hireDate: new Date('2020-08-01'), specialization: 'Writing', officeLocation: 'Room 208', departmentName: 'English' },
  { firstName: 'Arif', lastName: 'Hossain', email: 'david.king@edu.com', phone: '555-0115', hireDate: new Date('2019-08-01'), specialization: 'World History', officeLocation: 'Room 209', departmentName: 'History' },
  { firstName: 'Roksana', lastName: 'Begum', email: 'laura.green@edu.com', phone: '555-0116', hireDate: new Date('2018-08-01'), specialization: 'Genetics', officeLocation: 'Room 210', departmentName: 'Biology' },
  { firstName: 'Imran', lastName: 'Chowdhury', email: 'robert.young@edu.com', phone: '555-0117', hireDate: new Date('2017-08-01'), specialization: 'Robotics', officeLocation: 'Room 211', departmentName: 'Engineering' },
  { firstName: 'Mitu', lastName: 'Sultana', email: 'lisa.brown@edu.com', phone: '555-0118', hireDate: new Date('2016-08-01'), specialization: 'Finance', officeLocation: 'Room 212', departmentName: 'Economics' },
  { firstName: 'Kamal', lastName: 'Uddin', email: 'james.white@edu.com', phone: '555-0119', hireDate: new Date('2015-08-01'), specialization: 'Design', officeLocation: 'Room 213', departmentName: 'Fine Arts' },
];

const students = [
  {
    firstName: 'Ayesha', lastName: 'Rahman', email: 'alice.johnson@edu.com', phone: '555-0102', dateOfBirth: new Date('2005-03-15'), address: '12 Main St', status: 'ACTIVE', departmentName: 'Computer Science'
  },
  { firstName: 'Bashir', lastName: 'Ahmed', email: 'bob.johnson@edu.com', phone: '555-0121', dateOfBirth: new Date('2004-04-15'), address: '13 Main St', status: 'ACTIVE', departmentName: 'Business' },
  { firstName: 'Maliha', lastName: 'Akter', email: 'carol.johnson@edu.com', phone: '555-0122', dateOfBirth: new Date('2003-05-15'), address: '14 Main St', status: 'ACTIVE', departmentName: 'Mathematics' },
  { firstName: 'Fahim', lastName: 'Hossain', email: 'daniel.johnson@edu.com', phone: '555-0123', dateOfBirth: new Date('2002-06-15'), address: '15 Main St', status: 'ACTIVE', departmentName: 'Physics' },
  { firstName: 'Tanjila', lastName: 'Islam', email: 'eva.johnson@edu.com', phone: '555-0124', dateOfBirth: new Date('2001-07-15'), address: '16 Main St', status: 'ACTIVE', departmentName: 'English' },
  { firstName: 'Rafi', lastName: 'Khan', email: 'frank.johnson@edu.com', phone: '555-0125', dateOfBirth: new Date('2000-08-15'), address: '17 Main St', status: 'ACTIVE', departmentName: 'History' },
  { firstName: 'Sumaiya', lastName: 'Sultana', email: 'grace.johnson@edu.com', phone: '555-0126', dateOfBirth: new Date('2005-09-15'), address: '18 Main St', status: 'ACTIVE', departmentName: 'Biology' },
  { firstName: 'Nayeem', lastName: 'Chowdhury', email: 'henry.johnson@edu.com', phone: '555-0127', dateOfBirth: new Date('2004-10-15'), address: '19 Main St', status: 'ACTIVE', departmentName: 'Engineering' },
  { firstName: 'Ishrat', lastName: 'Jahan', email: 'ivy.johnson@edu.com', phone: '555-0128', dateOfBirth: new Date('2003-11-15'), address: '20 Main St', status: 'ACTIVE', departmentName: 'Economics' },
  { firstName: 'Siam', lastName: 'Uddin', email: 'jack.johnson@edu.com', phone: '555-0129', dateOfBirth: new Date('2002-12-15'), address: '21 Main St', status: 'ACTIVE', departmentName: 'Fine Arts' },
];

const courses = [
  { courseCode: 'CS101', courseName: 'Intro to Programming', description: 'Basics of programming', creditHours: 3, maxCapacity: 40, teacherEmail: 'john.smith@edu.com', departmentName: 'Computer Science', semesterName: 'Fall', academicYear: '2026-2027' },
  { courseCode: 'BUS102', courseName: 'Business Analytics', description: 'Business data analysis', creditHours: 3, maxCapacity: 40, teacherEmail: 'john.brown@edu.com', departmentName: 'Business', semesterName: 'Spring', academicYear: '2024-2025' },
  { courseCode: 'MAT103', courseName: 'Calculus I', description: 'Introduction to calculus', creditHours: 4, maxCapacity: 35, teacherEmail: 'emily.stone@edu.com', departmentName: 'Mathematics', semesterName: 'Fall', academicYear: '2024-2025' },
  { courseCode: 'PHY104', courseName: 'General Physics', description: 'Physics fundamentals', creditHours: 4, maxCapacity: 35, teacherEmail: 'michael.hall@edu.com', departmentName: 'Physics', semesterName: 'Spring', academicYear: '2025-2026' },
  { courseCode: 'ENG105', courseName: 'Academic Writing', description: 'Writing and research', creditHours: 3, maxCapacity: 40, teacherEmail: 'sarah.lee@edu.com', departmentName: 'English', semesterName: 'Fall', academicYear: '2025-2026' },
  { courseCode: 'HIS106', courseName: 'Modern History', description: 'Modern world history', creditHours: 3, maxCapacity: 40, teacherEmail: 'david.king@edu.com', departmentName: 'History', semesterName: 'Spring', academicYear: '2026-2027' },
  { courseCode: 'BIO107', courseName: 'Cell Biology', description: 'Cell structure and function', creditHours: 4, maxCapacity: 35, teacherEmail: 'laura.green@edu.com', departmentName: 'Biology', semesterName: 'Spring', academicYear: '2027-2028' },
  { courseCode: 'ENG108', courseName: 'Engineering Design', description: 'Engineering design methods', creditHours: 3, maxCapacity: 30, teacherEmail: 'robert.young@edu.com', departmentName: 'Engineering', semesterName: 'Fall', academicYear: '2027-2028' },
  { courseCode: 'ECO109', courseName: 'Microeconomics', description: 'Economic principles', creditHours: 3, maxCapacity: 40, teacherEmail: 'lisa.brown@edu.com', departmentName: 'Economics', semesterName: 'Spring', academicYear: '2028-2029' },
  { courseCode: 'ART110', courseName: 'Digital Arts', description: 'Digital art techniques', creditHours: 3, maxCapacity: 25, teacherEmail: 'james.white@edu.com', departmentName: 'Fine Arts', semesterName: 'Fall', academicYear: '2028-2029' },
];

export async function seedAcademic(): Promise<AcademicSeedContext> {
  const departmentRecords = await Promise.all(
    departments.map((department) =>
      prisma.department.upsert({
        where: { departmentName: department.departmentName },
        update: {},
        create: department,
      }),
    ),
  );

  const semesterRecords = await Promise.all(
    semesters.map(async (semester) => {
      const existing = await prisma.semester.findFirst({
        where: { semesterName: semester.semesterName, academicYear: semester.academicYear },
      });
      return existing ?? prisma.semester.create({ data: semester });
    }),
  );

  const departmentByName = new Map(departmentRecords.map((department) => [department.departmentName, department]));
  const teacherRecords = await Promise.all(
    teachers.map(({ departmentName, ...teacher }) =>
      prisma.teacher.upsert({
        where: { email: teacher.email },
        update: {},
        create: { ...teacher, departmentId: departmentByName.get(departmentName)!.id },
      }),
    ),
  );

  const studentRecords = await Promise.all(
    students.map(({ departmentName, ...student }) =>
      prisma.student.upsert({
        where: { email: student.email },
        update: {},
        create: { ...student, departmentId: departmentByName.get(departmentName)!.id },
      }),
    ),
  );

  const teacherByEmail = new Map(teacherRecords.map((teacher) => [teacher.email, teacher]));
  const semesterByKey = new Map(
    semesterRecords.map((semester) => [`${semester.semesterName}:${semester.academicYear}`, semester]),
  );
  const courseRecords = await Promise.all(
    courses.map(({ teacherEmail, departmentName, semesterName, academicYear, ...course }) =>
      prisma.course.upsert({
        where: { courseCode: course.courseCode },
        update: {},
        create: {
          ...course,
          teacherId: teacherByEmail.get(teacherEmail)!.id,
          departmentId: departmentByName.get(departmentName)!.id,
          semesterId: semesterByKey.get(`${semesterName}:${academicYear}`)!.id,
        },
      }),
    ),
  );

  return {
    departments: departmentRecords,
    semesters: semesterRecords,
    teachers: teacherRecords,
    students: studentRecords,
    courses: courseRecords,
  };
}
