import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllStudents = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { status: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take,
      orderBy: { lastName: 'asc' },
      include: { department: true },
    }),
    prisma.student.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getStudentById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.student.findUnique({
    where: { id },
    include: { department: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Student not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createStudent = catchAsync(async (req: any, res: any) => {
  const item = await prisma.student.create({
    data: req.body,
    include: { department: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Student created successfully', data: item });
});

export const updateStudent = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.student.update({
    where: { id },
    data: req.body,
    include: { department: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Student updated successfully', data: item });
});

export const deleteStudent = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.student.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Student deleted successfully' });
});
