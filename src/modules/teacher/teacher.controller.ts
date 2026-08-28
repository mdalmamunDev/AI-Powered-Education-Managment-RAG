import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllTeachers = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { specialization: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.teacher.findMany({
      where,
      skip,
      take,
      orderBy: { lastName: 'asc' },
      include: { department: true },
    }),
    prisma.teacher.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getTeacherById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.teacher.findUnique({
    where: { id },
    include: { department: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createTeacher = catchAsync(async (req: any, res: any) => {
  const item = await prisma.teacher.create({
    data: req.body,
    include: { department: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Teacher created successfully', data: item });
});

export const updateTeacher = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.teacher.update({
    where: { id },
    data: req.body,
    include: { department: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Teacher updated successfully', data: item });
});

export const deleteTeacher = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.teacher.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Teacher deleted successfully' });
});
