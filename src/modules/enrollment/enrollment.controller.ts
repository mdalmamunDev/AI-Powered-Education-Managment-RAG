import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta, normalizeDateFields } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllEnrollments = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy = 'enrollmentDate', sortOrder = 'desc' } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { status: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { student: true, course: true },
    }),
    prisma.enrollment.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getEnrollmentById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.enrollment.findUnique({
    where: { id },
    include: { student: true, course: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Enrollment not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createEnrollment = catchAsync(async (req: any, res: any) => {
  const item = await prisma.enrollment.create({
    data: normalizeDateFields(req.body, ['enrollmentDate']),
    include: { student: true, course: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Enrollment created successfully', data: item });
});

export const updateEnrollment = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.enrollment.update({
    where: { id },
    data: normalizeDateFields(req.body, ['enrollmentDate']),
    include: { student: true, course: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Enrollment updated successfully', data: item });
});

export const deleteEnrollment = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.enrollment.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Enrollment deleted successfully' });
});
