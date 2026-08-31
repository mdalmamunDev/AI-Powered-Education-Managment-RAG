import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta, normalizeDateFields } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllAttendances = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { status: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.attendance.findMany({
      where,
      skip,
      take,
      orderBy: { attendanceDate: 'desc' },
      include: { student: true, course: true },
    }),
    prisma.attendance.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getAttendanceById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.attendance.findUnique({
    where: { id },
    include: { student: true, course: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Attendance not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createAttendance = catchAsync(async (req: any, res: any) => {
  const item = await prisma.attendance.create({
    data: normalizeDateFields(req.body, ['attendanceDate']),
    include: { student: true, course: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Attendance created successfully', data: item });
});

export const updateAttendance = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.attendance.update({
    where: { id },
    data: normalizeDateFields(req.body, ['attendanceDate']),
    include: { student: true, course: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Attendance updated successfully', data: item });
});

export const deleteAttendance = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.attendance.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Attendance deleted successfully' });
});
