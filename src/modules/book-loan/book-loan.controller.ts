import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllBookLoans = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { status: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.bookLoan.findMany({
      where,
      skip,
      take,
      orderBy: { checkoutDate: 'desc' },
      include: { book: true, student: true },
    }),
    prisma.bookLoan.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getBookLoanById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.bookLoan.findUnique({
    where: { id },
    include: { book: true, student: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'BookLoan not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createBookLoan = catchAsync(async (req: any, res: any) => {
  const item = await prisma.bookLoan.create({
    data: req.body,
    include: { book: true, student: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'BookLoan created successfully', data: item });
});

export const updateBookLoan = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.bookLoan.update({
    where: { id },
    data: req.body,
    include: { book: true, student: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'BookLoan updated successfully', data: item });
});

export const deleteBookLoan = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.bookLoan.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'BookLoan deleted successfully' });
});
