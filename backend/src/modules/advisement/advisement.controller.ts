import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta, normalizeDateFields } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';
import { safeEnqueueEmbedding, deleteEmbeddings } from '../embedding/helper';

export const getAllAdvisements = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy = 'meetingDate', sortOrder = 'desc' } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { topic: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.advisement.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { student: true, teacher: true },
    }),
    prisma.advisement.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getAdvisementById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.advisement.findUnique({
    where: { id },
    include: { student: true, teacher: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Advisement not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createAdvisement = catchAsync(async (req: any, res: any) => {
  const item = await prisma.advisement.create({
    data: normalizeDateFields(req.body, ['meetingDate']),
    include: { student: true, teacher: true },
  });
  await safeEnqueueEmbedding('advisement', item.id, item);
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Advisement created successfully', data: item });
});

export const updateAdvisement = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.advisement.update({
    where: { id },
    data: normalizeDateFields(req.body, ['meetingDate']),
    include: { student: true, teacher: true },
  });
  await safeEnqueueEmbedding('advisement', item.id, item);
  sendResponse(res, { code: StatusCodes.OK, message: 'Advisement updated successfully', data: item });
});

export const deleteAdvisement = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.advisement.delete({ where: { id } });
  await deleteEmbeddings('advisement', id);
  sendResponse(res, { code: StatusCodes.OK, message: 'Advisement deleted successfully' });
});
