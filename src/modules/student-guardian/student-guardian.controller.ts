import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllStudentGuardianLinks = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy = 'id', sortOrder = 'asc' } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = {};

  const [items, totalCount] = await Promise.all([
    prisma.studentGuardian.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { student: true, guardian: true },
    }),
    prisma.studentGuardian.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getStudentGuardianLinkById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.studentGuardian.findUnique({
    where: { id },
    include: { student: true, guardian: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'StudentGuardianLink not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createStudentGuardianLink = catchAsync(async (req: any, res: any) => {
  const item = await prisma.studentGuardian.create({
    data: req.body,
    include: { student: true, guardian: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'StudentGuardianLink created successfully', data: item });
});

export const updateStudentGuardianLink = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.studentGuardian.update({
    where: { id },
    data: req.body,
    include: { student: true, guardian: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'StudentGuardianLink updated successfully', data: item });
});

export const deleteStudentGuardianLink = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.studentGuardian.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'StudentGuardianLink deleted successfully' });
});
