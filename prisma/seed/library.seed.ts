import { prisma } from '../prisma';
import { AcademicSeedContext } from './types';

const books = [
  { isbn: '978-0135166307', title: 'Effective Java', author: 'Sakib Rahman', publisher: 'Addison-Wesley', publicationYear: 2018, category: 'Programming', copiesAvailable: 5 },
  { isbn: '978-0135166308', title: 'Business Analytics', author: 'Tanvir Ahmed', publisher: 'Edu Press', publicationYear: 2019, category: 'Business', copiesAvailable: 5 },
  { isbn: '978-0135166309', title: 'Calculus Fundamentals', author: 'Nusrat Jahan', publisher: 'Edu Press', publicationYear: 2020, category: 'Mathematics', copiesAvailable: 5 },
  { isbn: '978-0135166310', title: 'General Physics', author: 'Mahmud Hasan', publisher: 'Edu Press', publicationYear: 2018, category: 'Physics', copiesAvailable: 5 },
  { isbn: '978-0135166311', title: 'Academic Writing', author: 'Sadia Islam', publisher: 'Edu Press', publicationYear: 2021, category: 'English', copiesAvailable: 5 },
  { isbn: '978-0135166312', title: 'Modern History', author: 'Arif Hossain', publisher: 'Edu Press', publicationYear: 2017, category: 'History', copiesAvailable: 5 },
  { isbn: '978-0135166313', title: 'Cell Biology', author: 'Roksana Begum', publisher: 'Edu Press', publicationYear: 2022, category: 'Biology', copiesAvailable: 5 },
  { isbn: '978-0135166314', title: 'Engineering Design', author: 'Imran Chowdhury', publisher: 'Edu Press', publicationYear: 2020, category: 'Engineering', copiesAvailable: 5 },
  { isbn: '978-0135166315', title: 'Microeconomics', author: 'Mitu Sultana', publisher: 'Edu Press', publicationYear: 2019, category: 'Economics', copiesAvailable: 5 },
  { isbn: '978-0135166316', title: 'Digital Arts', author: 'Kamal Uddin', publisher: 'Edu Press', publicationYear: 2023, category: 'Fine Arts', copiesAvailable: 5 },
];

const loans = [
  { isbn: '978-0135166307', studentEmail: 'alice.johnson@edu.com', dueDate: new Date('2026-09-30'), status: 'BORROWED' },
  { isbn: '978-0135166308', studentEmail: 'bob.johnson@edu.com', dueDate: new Date('2026-10-01'), status: 'BORROWED' },
  { isbn: '978-0135166309', studentEmail: 'carol.johnson@edu.com', dueDate: new Date('2026-10-02'), status: 'BORROWED' },
  { isbn: '978-0135166310', studentEmail: 'daniel.johnson@edu.com', dueDate: new Date('2026-10-03'), status: 'BORROWED' },
  { isbn: '978-0135166311', studentEmail: 'eva.johnson@edu.com', dueDate: new Date('2026-10-04'), status: 'BORROWED' },
  { isbn: '978-0135166312', studentEmail: 'frank.johnson@edu.com', dueDate: new Date('2026-10-05'), status: 'BORROWED' },
  { isbn: '978-0135166313', studentEmail: 'grace.johnson@edu.com', dueDate: new Date('2026-10-06'), status: 'BORROWED' },
  { isbn: '978-0135166314', studentEmail: 'henry.johnson@edu.com', dueDate: new Date('2026-10-07'), status: 'BORROWED' },
  { isbn: '978-0135166315', studentEmail: 'ivy.johnson@edu.com', dueDate: new Date('2026-10-08'), status: 'BORROWED' },
  { isbn: '978-0135166316', studentEmail: 'jack.johnson@edu.com', dueDate: new Date('2026-10-09'), status: 'BORROWED' },
];

export async function seedLibrary({ students }: AcademicSeedContext) {
  const bookRecords = await Promise.all(
    books.map((book) => prisma.libraryBook.upsert({ where: { isbn: book.isbn }, update: {}, create: book })),
  );
  const bookByIsbn = new Map(bookRecords.map((book) => [book.isbn, book]));
  const studentByEmail = new Map(students.map((student) => [student.email, student]));

  for (const { isbn, studentEmail, ...record } of loans) {
    const bookId = bookByIsbn.get(isbn)!.id;
    const studentId = studentByEmail.get(studentEmail)!.id;
    const existing = await prisma.bookLoan.findFirst({ where: { bookId, studentId, status: record.status } });
    if (!existing) await prisma.bookLoan.create({ data: { ...record, bookId, studentId } });
  }

  return bookRecords;
}
