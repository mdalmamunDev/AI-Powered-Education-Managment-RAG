import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../../helpers/globals';
import catchAsync from '../../../helpers/catchAsync';
import ApiError from '../../../helpers/ApiError';
import { prisma } from '../../../../prisma/prisma';



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

