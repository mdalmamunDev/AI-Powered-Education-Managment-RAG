import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../../helpers/globals';
import catchAsync from '../../../helpers/catchAsync';
import ApiError from '../../../helpers/ApiError';
import { prisma } from '../../../../prisma/prisma';



// GET /roles — paginated list used by the Roles admin page. Each row carries
// `permissionCount` (granted permissions) and `userCount` (accounts currently
// assigned this role title) so the UI can show why a role cannot be deleted.
export const getAllRoles = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy = 'createdAt', sortOrder = 'desc' } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? { title: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [items, totalCount, userCounts] = await Promise.all([
    prisma.role.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.role.count({ where }),
    // User.role stores the role title as a plain string (no FK), so assigned
    // accounts are counted by that title.
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
  ]);

  const usersByTitle = new Map<string, number>(
    userCounts.map((entry) => [entry.role, entry._count._all]),
  );

  const data = items.map((role) => ({
    ...role,
    permissionCount: (role.permissionKeys || []).length,
    userCount: usersByTitle.get(role.title) || 0,
  }));

  sendResponse(res, {
    code: StatusCodes.OK,
    data,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

// Body is already validated + trimmed by validate(createRoleSchema) in routes.
export const createRole = catchAsync(async (req: any, res: any) => {
  const { title } = req.body;

  const item = await prisma.role.create({ data: { title } });
  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Role created successfully',
    data: item,
  });
});

export const updateRole = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const { title, moduleKeys, permissionKeys } = req.body;

  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Role not found.');

  const item = await prisma.role.update({ where: { id }, data: {title, moduleKeys, permissionKeys} });
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Role updated successfully',
    data: item,
  });
});

export const deleteRole = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.role.findUnique({ where: { id } });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Role not found.');

  // User.role stores the role title as a plain string (no FK), so block
  // deleting a role that is still assigned to user accounts.
  const users = await prisma.user.count({ where: { role: item.title } });
  if (users > 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Cannot delete: this role is still assigned to ${users} user(s).`,
    );
  }

  await prisma.role.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Role deleted successfully' });
});

