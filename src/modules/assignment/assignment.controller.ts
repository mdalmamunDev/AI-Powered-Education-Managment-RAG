import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllAssignments = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.assignment.findMany({
      where,
      skip,
      take,
      orderBy: { dueDate: 'asc' },
      include: { course: true, teacher: true },
    }),
    prisma.assignment.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getAssignmentById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.assignment.findUnique({
    where: { id },
    include: { course: true, teacher: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Assignment not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createAssignment = catchAsync(async (req: any, res: any) => {
  const item = await prisma.assignment.create({
    data: req.body,
    include: { course: true, teacher: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Assignment created successfully', data: item });
});

export const updateAssignment = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.assignment.update({
    where: { id },
    data: req.body,
    include: { course: true, teacher: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Assignment updated successfully', data: item });
});

export const deleteAssignment = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.assignment.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Assignment deleted successfully' });
});
