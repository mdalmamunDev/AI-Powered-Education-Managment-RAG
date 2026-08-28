import bcrypt from 'bcrypt';
import { prisma } from './prisma';

async function main() {
  const hashed = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@edu.com' },
    update: {},
    create: { name: 'System Admin', email: 'admin@edu.com', password: hashed, role: 'ADMIN' },
  });

  const department = await prisma.department.upsert({
    where: { departmentName: 'Computer Science' },
    update: {},
    create: { departmentName: 'Computer Science', headOfDepartment: 'Dr. Jane Doe', location: 'Building A' },
  });

  await prisma.semester.create({
    data: {
      semesterName: 'Fall',
      academicYear: '2026-2027',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-20'),
    },
  }).catch(() => undefined);

  console.log('Seed complete. Admin login: admin@edu.com / Admin@123');
  console.log('Department seeded:', department.departmentName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
