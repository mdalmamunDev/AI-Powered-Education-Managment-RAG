import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllGrades = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { assessmentType: { contains: search, mode: 'insensitive' as const } },
          { gradeLetter: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.grade.findMany({
      where,
      skip,
      take,
      orderBy: { dateRecorded: 'desc' },
      include: { student: true, course: true },
    }),
    prisma.grade.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getGradeById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.grade.findUnique({
    where: { id },
    include: { student: true, course: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Grade not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createGrade = catchAsync(async (req: any, res: any) => {
  const item = await prisma.grade.create({
    data: req.body,
    include: { student: true, course: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Grade created successfully', data: item });
});

export const updateGrade = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.grade.update({
    where: { id },
    data: req.body,
    include: { student: true, course: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Grade updated successfully', data: item });
});

export const deleteGrade = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.grade.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Grade deleted successfully' });
});
