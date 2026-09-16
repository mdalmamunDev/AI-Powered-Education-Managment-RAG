import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { SeedContext } from './types';

const users = [
  { name: 'Abdul Karim', email: 'admin@gmail.com', password: '1qazxsw2', role: 'admin' },
  { name: 'Mehedi Hasan', email: 'staff2@edu.com', password: 'Staff@123', role: 'staff' },
  { name: 'Jannatul Ferdous', email: 'staff3@edu.com', password: 'Staff@123', role: 'staff' },
  { name: 'Rakibul Islam', email: 'staff4@edu.com', password: 'Staff@123', role: 'staff' },
  { name: 'Moumita Akter', email: 'staff5@edu.com', password: 'Staff@123', role: 'staff' },
  { name: 'Shakil Ahmed', email: 'staff6@edu.com', password: 'Staff@123', role: 'staff' },
  { name: 'Sabrina Yasmin', email: 'staff7@edu.com', password: 'Staff@123', role: 'staff' },
  { name: 'Munna Hossain', email: 'staff8@edu.com', password: 'Staff@123', role: 'staff' },
  { name: 'Tasnim Jahan', email: 'staff9@edu.com', password: 'Staff@123', role: 'staff' },
  { name: 'Aminul Haque', email: 'staff10@edu.com', password: 'Staff@123', role: 'staff' },
];

export async function seedAuth(): Promise<SeedContext['users']> {
  return Promise.all(
    users.map(async ({ password, ...user }) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: { ...user, password: await bcrypt.hash(password, 10) },
      }),
    ),
  );
}
