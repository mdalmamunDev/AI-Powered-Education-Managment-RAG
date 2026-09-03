import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllGuardians = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy = 'lastName', sortOrder = 'asc' } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { relationship: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.parentGuardian.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { students: { include: { student: true } } },
    }),
    prisma.parentGuardian.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getGuardianById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.parentGuardian.findUnique({
    where: { id },
    include: { students: { include: { student: true } } },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Guardian not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createGuardian = catchAsync(async (req: any, res: any) => {
  const item = await prisma.parentGuardian.create({
    data: req.body,
    include: { students: { include: { student: true } } },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Guardian created successfully', data: item });
});

export const updateGuardian = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.parentGuardian.update({
    where: { id },
    data: req.body,
    include: { students: { include: { student: true } } },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Guardian updated successfully', data: item });
});

export const deleteGuardian = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.parentGuardian.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Guardian deleted successfully' });
});
