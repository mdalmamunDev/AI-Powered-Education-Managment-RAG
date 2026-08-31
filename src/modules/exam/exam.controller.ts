import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta, normalizeDateFields } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllExams = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { examType: { contains: search, mode: 'insensitive' as const } },
          { location: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take,
      orderBy: { examDate: 'asc' },
      include: { course: true },
    }),
    prisma.exam.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getExamById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.exam.findUnique({
    where: { id },
    include: { course: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Exam not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createExam = catchAsync(async (req: any, res: any) => {
  const item = await prisma.exam.create({
    data: normalizeDateFields(req.body, ['examDate']),
    include: { course: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Exam created successfully', data: item });
});

export const updateExam = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.exam.update({
    where: { id },
    data: normalizeDateFields(req.body, ['examDate']),
    include: { course: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Exam updated successfully', data: item });
});

export const deleteExam = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.exam.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Exam deleted successfully' });
});
