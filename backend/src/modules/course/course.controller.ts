import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';
import { safeEnqueueEmbedding, deleteEmbeddings } from '../embedding/helper';

export const getAllCourses = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy = 'courseCode', sortOrder = 'asc' } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { courseCode: { contains: search, mode: 'insensitive' as const } },
          { courseName: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { teacher: true, department: true, semester: true },
    }),
    prisma.course.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getCourseById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.course.findUnique({
    where: { id },
    include: { teacher: true, department: true, semester: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Course not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createCourse = catchAsync(async (req: any, res: any) => {
  const item = await prisma.course.create({
    data: req.body,
    include: { teacher: true, department: true, semester: true },
  });
  await safeEnqueueEmbedding('course', item.id, item);
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Course created successfully', data: item });
});

export const updateCourse = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.course.update({
    where: { id },
    data: req.body,
    include: { teacher: true, department: true, semester: true },
  });
  await safeEnqueueEmbedding('course', item.id, item);
  sendResponse(res, { code: StatusCodes.OK, message: 'Course updated successfully', data: item });
});

export const deleteCourse = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.course.delete({ where: { id } });
  await deleteEmbeddings('course', id);
  sendResponse(res, { code: StatusCodes.OK, message: 'Course deleted successfully' });
});
