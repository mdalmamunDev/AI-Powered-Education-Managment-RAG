import { prisma } from '../prisma';
import { removeRedisKey } from '../../src/helpers/redis.service';

const DEFAULT_PERMISSIONS = [
  'create',
  'read',
  'update',
  'delete',
];

type ModuleData = {
  title: string;
  key: string;
  permissions?: string[];
  children?: ModuleData[];
};

const moduleTree: ModuleData[] = [
  {
    title: 'Dashboard',
    key: 'dashboard',
    permissions: ['read'],
  },
  {
    title: 'Academics',
    key: 'academics',
    permissions: [],
    children: [
      {
        title: 'Department',
        key: 'department',
      },
      {
        title: 'Semester',
        key: 'semester',
      },
    ],
  },
  {
    title: 'People',
    key: 'people',
    permissions: [],
    children: [
      {
        title: 'Teacher',
        key: 'teacher',
      },
      {
        title: 'Student',
        key: 'student',
      },
      {
        title: 'Guardian',
        key: 'guardian',
      },
      {
        title: 'Student Guardian',
        key: 'student-guardian',
      },
    ],
  },
  {
    title: 'Academic',
    key: 'academic',
    permissions: [],
    children: [
      {
        title: 'Course',
        key: 'course',
      },
      {
        title: 'Enrollment',
        key: 'enrollment',
      },
      {
        title: 'Attendance',
        key: 'attendance',
      },
      {
        title: 'Grade',
        key: 'grade',
      },
      {
        title: 'Assignment',
        key: 'assignment',
      },
      {
        title: 'Submission',
        key: 'submission',
      },
      {
        title: 'Exam',
        key: 'exam',
      },
    ],
  },
  {
    title: 'Administration',
    key: 'administration',
    permissions: [],
    children: [
      {
        title: 'Classroom',
        key: 'classroom',
      },
      {
        title: 'Schedule',
        key: 'schedule',
      },
      {
        title: 'Payment',
        key: 'payment',
      },
      {
        title: 'Office Hour',
        key: 'office-hour',
      },
      {
        title: 'Advisement',
        key: 'advisement',
      },
    ],
  },
  {
    title: 'Library',
    key: 'library',
    permissions: [],
    children: [
      {
        title: 'Library Book',
        key: 'library-book',
      },
      {
        title: 'Book Loan',
        key: 'book-loan',
      },
    ],
  },
  {
    title: 'Settings',
    key: 'settings',
    permissions: [],
    children: [
      {
        title: 'Profile',
        key: 'profile',
        permissions: ['read', 'update', 'delete']
      },
      {
        title: 'Change Password',
        key: 'change-password',
      },
    ],
  },
  {
    title: 'RBAC',
    key: 'rbac-group',
    permissions: [],
    children: [
      {
        title: 'Role',
        key: 'role',
      },
      {
        title: 'RBAC',
        key: 'rbac',
        permissions: ['read']
      },
    ],
  },
  {
    title: 'Assistant',
    key: 'assistant',
    permissions: ['read']
  },
];

async function seedModules(
  modules: ModuleData[],
  parentId?: number,
) {
  for (const moduleData of modules) {
    // Create/update module
    const module = await prisma.module.upsert({
      where: {
        key: moduleData.key,
      },
      update: {
        parentModuleId: parentId ?? null,
        title: moduleData.title,
      },
      create: {
        title: moduleData.title,
        key: moduleData.key,
        parentModuleId: parentId ?? null,
      },
    });

    // undefined => CRUD
    // []        => no permissions
    const permissions =
      moduleData.permissions ?? DEFAULT_PERMISSIONS;

    // Create permissions
    if (permissions.length > 0) {
      await prisma.permission.createMany({
        data: permissions.map((permission) => ({
          key: `${moduleData.key}.${permission}`,
          moduleId: module.id,
        })),
        skipDuplicates: true,
      });
    }

    // Create children recursively
    if (moduleData.children?.length) {
      await seedModules(
        moduleData.children,
        module.id,
      );
    }
  }
}

export default async function seedRbac() {
  console.log('🌱 Seeding RBAC...');

  // Wipe previous RBAC data so the seed file is the single source of truth.
  // Order matters for clarity: permissions reference modules by id, and
  // Module has a self-relation (parentModuleId) with onDelete: SetNull, so
  // deleting all rows never violates a constraint.
  // ⚠️ Deleting roles also wipes their permissionKeys grants — seeded
  // accounts only reference the 'admin'/'staff' titles, which are recreated
  // below before seedAuth() runs.
  await prisma.permission.deleteMany();
  await prisma.module.deleteMany();
  await prisma.role.deleteMany();
  console.log('🧹 Cleared existing roles, modules and permissions');

  // Best-effort: drop cached permission sets (role:<title>:permission-keys),
  // otherwise a wiped role could keep serving its old grants for up to an hour.
  try {
    await removeRedisKey('role:*');
    console.log('🧹 Cleared cached role permission sets from Redis');
  } catch {
    console.log('⚠️ Redis unavailable — skipping permission cache purge');
  }

  // Seed roles
  const roles = ['admin', 'staff'];

  await Promise.all(
    roles.map((title) =>
      prisma.role.upsert({
        where: { title },
        update: {},
        create: { title },
      }),
    ),
  );

  console.log('✅ Roles seeded:', roles);

  // Seed modules + permissions
  await seedModules(moduleTree);

  console.log('✅ Modules and permissions seeded');
}