import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllPayments = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { paymentMethod: { contains: search, mode: 'insensitive' as const } },
          { status: { contains: search, mode: 'insensitive' as const } },
          { semester: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { paymentDate: 'desc' },
      include: { student: true },
    }),
    prisma.payment.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getPaymentById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.payment.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createPayment = catchAsync(async (req: any, res: any) => {
  const item = await prisma.payment.create({
    data: req.body,
    include: { student: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Payment created successfully', data: item });
});

export const updatePayment = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.payment.update({
    where: { id },
    data: req.body,
    include: { student: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Payment updated successfully', data: item });
});

export const deletePayment = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.payment.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Payment deleted successfully' });
});
