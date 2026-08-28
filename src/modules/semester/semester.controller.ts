import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllSemesters = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { semesterName: { contains: search, mode: 'insensitive' as const } },
          { academicYear: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.semester.findMany({
      where,
      skip,
      take,
      orderBy: { startDate: 'asc' },
    }),
    prisma.semester.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getSemesterById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.semester.findUnique({
    where: { id },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Semester not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createSemester = catchAsync(async (req: any, res: any) => {
  const item = await prisma.semester.create({
    data: req.body,
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Semester created successfully', data: item });
});

export const updateSemester = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.semester.update({
    where: { id },
    data: req.body,
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Semester updated successfully', data: item });
});

export const deleteSemester = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.semester.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Semester deleted successfully' });
});
