import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';
import { safeEnqueueEmbedding, deleteEmbeddings } from '../embedding/helper';

export const getAllClassrooms = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy = 'building', sortOrder = 'asc' } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { building: { contains: search, mode: 'insensitive' as const } },
          { roomNumber: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.classroom.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.classroom.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getClassroomById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.classroom.findUnique({
    where: { id },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Classroom not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createClassroom = catchAsync(async (req: any, res: any) => {
  const item = await prisma.classroom.create({
    data: req.body,
  });
  await safeEnqueueEmbedding('classroom', item.id, item);
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Classroom created successfully', data: item });
});

export const updateClassroom = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.classroom.update({
    where: { id },
    data: req.body,
  });
  await safeEnqueueEmbedding('classroom', item.id, item);
  sendResponse(res, { code: StatusCodes.OK, message: 'Classroom updated successfully', data: item });
});

export const deleteClassroom = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.classroom.delete({ where: { id } });
  await deleteEmbeddings('classroom', id);
  sendResponse(res, { code: StatusCodes.OK, message: 'Classroom deleted successfully' });
});
