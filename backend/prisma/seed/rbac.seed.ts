import { prisma } from '../prisma';

const DEFAULT_PERMISSIONS = [
  'create',
  'read',
  'update',
  'delete',
];

type ModuleData = {
  title: string;
  permissions?: string[];
  children?: ModuleData[];
};

const moduleTree: ModuleData[] = [
  {
    title: 'dashboard',
    permissions: ['read'],
  },

  {
    title: 'academics',
    permissions: [],
    children: [
      {
        title: 'department',
        permissions: ['create', 'read', 'update', 'delete'],
      },
      {
        title: 'semester',
        permissions: ['create', 'read', 'update', 'delete'],
      },
    ],
  },

  {
    title: 'people',
    permissions: [],
    children: [
      { title: 'teacher' },
      { title: 'student' },
      { title: 'guardian' },
      { title: 'student-guardian' },
    ],
  },

  {
    title: 'academic',
    permissions: [],
    children: [
      { title: 'course' },
      { title: 'enrollment' },
      { title: 'attendance' },
      { title: 'grade' },
      { title: 'assignment' },
      { title: 'submission' },
      { title: 'exam' },
    ],
  },

  {
    title: 'administration',
    permissions: [],
    children: [
      { title: 'classroom' },
      { title: 'schedule' },
      { title: 'payment' },
      { title: 'office-hour' },
      { title: 'advisement' },
    ],
  },

  {
    title: 'library',
    permissions: [],
    children: [
      { title: 'library-book' },
      { title: 'book-loan' },
    ],
  },

  {
    title: 'settings',
    permissions: [],
    children: [
      { title: 'role' },
      { title: 'module' },
      { title: 'permission' },
      { title: 'user' },
      { title: 'assistant' },
    ],
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
        title: moduleData.title,
      },
      update: {
        parentModuleId: parentId ?? null,
      },
      create: {
        title: moduleData.title,
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
          key: `${moduleData.title}.${permission}`,
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