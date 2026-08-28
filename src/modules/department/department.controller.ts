import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllDepartments = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { departmentName: { contains: search, mode: 'insensitive' as const } },
          { headOfDepartment: { contains: search, mode: 'insensitive' as const } },
          { location: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.department.findMany({
      where,
      skip,
      take,
      orderBy: { departmentName: 'asc' },
    }),
    prisma.department.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getDepartmentById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.department.findUnique({
    where: { id },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Department not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createDepartment = catchAsync(async (req: any, res: any) => {
  const item = await prisma.department.create({
    data: req.body,
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Department created successfully', data: item });
});

export const updateDepartment = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.department.update({
    where: { id },
    data: req.body,
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Department updated successfully', data: item });
});

export const deleteDepartment = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.department.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Department deleted successfully' });
});
