import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

// Columns the list may be sorted by. Keep this a whitelist: an arbitrary
// ?sortBy= value would otherwise reach Prisma and blow up as a 500.
const SORTABLE_FIELDS = ['name', 'email', 'role', 'createdAt', 'updatedAt'];

// Everything the API is allowed to return about an account — never the hash.
const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

// Resolves a client-supplied role title against the Role table.
// Role titles are the source of truth for permissions (see
// middlewares/auth.ts -> getPermissionsByRole), so an account may only keep a
// title that actually exists. Matching is case-insensitive but the canonical
// Role.title is what gets stored — otherwise a stored "ADMIN" would silently
// grant nothing, since the permission lookup is an exact match.
const resolveRoleTitle = async (value: any): Promise<string> => {
  const title = String(value ?? '').trim();
  if (!title) throw new ApiError(StatusCodes.BAD_REQUEST, 'A role title is required.');

  const role = await prisma.role.findFirst({
    where: { title: { equals: title, mode: 'insensitive' } },
    select: { title: true },
  });

  if (!role) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Unknown role "${title}". Create it on the Roles page first.`,
    );
  }

  return role.title;
};

// GET /users — paginated list of every account (admins & staff) together with
// the role title it holds, so a role can be assigned straight from the row.
// `extra.roleCounts` powers the per-role summary on the Users page and
// `extra.totalUsers` is the count of all accounts, regardless of the filters.
export const getAllUsers = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy, sortOrder = 'desc' } = getPagination(req.query);
  const search = (req.query.search as string | undefined)?.trim();
  const role = (req.query.role as string | undefined)?.trim();

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { role: { contains: search, mode: 'insensitive' } },
    ];
  }
  // ?role=staff — the role filter on the Users page.
  if (role) where.role = { equals: role, mode: 'insensitive' };

  const orderField = SORTABLE_FIELDS.includes(sortBy as string) ? (sortBy as string) : 'createdAt';

  const [items, totalCount, roleCounts, roles] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { [orderField]: sortOrder },
      select: USER_SELECT,
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.role.findMany({ select: { title: true } }),
  ]);

  // Flag rows whose stored title no longer exists as a Role, so the UI can warn
  // that the account currently holds no permissions at all.
  const knownTitles = new Set(roles.map((knownRole) => knownRole.title));

  const data = items.map((user) => ({ ...user, roleExists: knownTitles.has(user.role) }));

  sendResponse(res, {
    code: StatusCodes.OK,
    data,
    pagination: buildPaginationMeta(totalCount, page, limit),
    extra: {
      totalUsers: roleCounts.reduce((sum, entry) => sum + entry._count._all, 0),
      roleCounts: roleCounts
        .map((entry) => ({ role: entry.role, count: entry._count._all }))
        .sort((a, b) => b.count - a.count),
    },
  });
});
// GET /users/roles — the role titles an account may be assigned.
// Served from here (instead of reusing GET /roles) so the Users page only needs
// its own read permission to fill the role dropdowns.
export const getAssignableRoles = catchAsync(async (req: any, res: any) => {
  const [roles, userCounts] = await Promise.all([
    prisma.role.findMany({ orderBy: { title: 'asc' } }),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
  ]);

  const counts = new Map<string, number>(
    userCounts.map((entry) => [entry.role, entry._count._all]),
  );

  const data = roles.map((assignableRole) => ({
    id: assignableRole.id,
    title: assignableRole.title,
    permissionCount: (assignableRole.permissionKeys || []).length,
    userCount: counts.get(assignableRole.title) || 0,
  }));

  sendResponse(res, { code: StatusCodes.OK, data });
});

export const getUserById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');

  sendResponse(res, { code: StatusCodes.OK, data: item });
});

// Body is already validated + trimmed by validate(createUserSchema) in routes.
export const createUser = catchAsync(async (req: any, res: any) => {
  const { name, email, password, role } = req.body;

  const item = await prisma.user.create({
    data: {
      name,
      email,
      // Defaults to staff, mirroring POST /auth/register.
      role: await resolveRoleTitle(role || 'staff'),
      password: await bcrypt.hash(password, 10),
    },
    select: USER_SELECT,
  });

  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'User created successfully',
    data: item,
  });
});

// Handles both a full edit from the modal and a role-only assignment
// (PUT /users/:id with just { role }), which is what the row dropdown sends.
export const updateUser = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  // A blank password means "keep the current one".
  if (password) data.password = await bcrypt.hash(password, 10);

  if (role !== undefined) {
    const title = await resolveRoleTitle(role);
    // Blocking self-demotion: dropping your own role would revoke the very
    // permissions needed to grant it back.
    if (id === req.user.id && title !== existing.role) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot change your own role.');
    }
    data.role = title;
  }

  const item = await prisma.user.update({ where: { id }, data, select: USER_SELECT });

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User updated successfully',
    data: item,
  });
});

export const deleteUser = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);

  if (id === req.user.id) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot delete your own account.');
  }

  const item = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');

  await prisma.user.delete({ where: { id } });

  sendResponse(res, { code: StatusCodes.OK, message: 'User deleted successfully' });
});

