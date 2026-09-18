import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../../helpers/globals';
import catchAsync from '../../../helpers/catchAsync';
import ApiError from '../../../helpers/ApiError';
import { prisma } from '../../../../prisma/prisma';

export const getAllModules = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy = 'id', sortOrder = 'asc' } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? { title: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.module.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { parent: true, children: true },
    }),
    prisma.module.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getModuleById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.module.findUnique({
    where: { id },
    include: { parent: true, children: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

// Modules are seeded (see prisma/seed/rbac.seed.ts), so there is intentionally
// no create/delete here — admins may only rename or re-parent them.
export const updateModule = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const { title, parentModuleId } = req.body;

  const existing = await prisma.module.findUnique({ where: { id } });
  if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found.');

  // Prevent re-parenting a module under one of its own descendants (cycle).
  if (parentModuleId !== undefined && parentModuleId !== null) {
    if (parentModuleId === id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'A module cannot be its own parent.');
    }

    let ancestor: { parentModuleId: number | null } | null =
      await prisma.module.findUnique({
        where: { id: Number(parentModuleId) },
        select: { id: true, parentModuleId: true },
      });
    if (!ancestor) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid reference: related record does not exist.');

    while (ancestor?.parentModuleId) {
      if (ancestor.parentModuleId === id) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Invalid parent: a module cannot be nested under its own child.',
        );
      }
      ancestor = await prisma.module.findUnique({
        where: { id: ancestor.parentModuleId },
        select: { id: true, parentModuleId: true },
      });
    }
  }

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (parentModuleId !== undefined) {
    data.parentModuleId = parentModuleId === null ? null : Number(parentModuleId);
  }

  const item = await prisma.module.update({
    where: { id },
    data,
    include: { parent: true, children: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Module updated successfully', data: item });
});
