import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllOfficeHours = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { dayOfWeek: { contains: search, mode: 'insensitive' as const } },
          { location: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.officeHours.findMany({
      where,
      skip,
      take,
      orderBy: { dayOfWeek: 'asc' },
      include: { teacher: true },
    }),
    prisma.officeHours.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getOfficeHourById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.officeHours.findUnique({
    where: { id },
    include: { teacher: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'OfficeHour not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createOfficeHour = catchAsync(async (req: any, res: any) => {
  const item = await prisma.officeHours.create({
    data: req.body,
    include: { teacher: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'OfficeHour created successfully', data: item });
});

export const updateOfficeHour = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.officeHours.update({
    where: { id },
    data: req.body,
    include: { teacher: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'OfficeHour updated successfully', data: item });
});

export const deleteOfficeHour = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.officeHours.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'OfficeHour deleted successfully' });
});
