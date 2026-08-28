import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllSchedules = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { dayOfWeek: { contains: search, mode: 'insensitive' as const } },
          { semester: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.schedule.findMany({
      where,
      skip,
      take,
      orderBy: { dayOfWeek: 'asc' },
      include: { course: true, classroom: true },
    }),
    prisma.schedule.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getScheduleById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.schedule.findUnique({
    where: { id },
    include: { course: true, classroom: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Schedule not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createSchedule = catchAsync(async (req: any, res: any) => {
  const item = await prisma.schedule.create({
    data: req.body,
    include: { course: true, classroom: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Schedule created successfully', data: item });
});

export const updateSchedule = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.schedule.update({
    where: { id },
    data: req.body,
    include: { course: true, classroom: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Schedule updated successfully', data: item });
});

export const deleteSchedule = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.schedule.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Schedule deleted successfully' });
});
