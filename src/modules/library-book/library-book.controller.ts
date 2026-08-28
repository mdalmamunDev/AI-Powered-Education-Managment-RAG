import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllLibraryBooks = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } },
          { isbn: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.libraryBook.findMany({
      where,
      skip,
      take,
      orderBy: { title: 'asc' },
    }),
    prisma.libraryBook.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getLibraryBookById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.libraryBook.findUnique({
    where: { id },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'LibraryBook not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createLibraryBook = catchAsync(async (req: any, res: any) => {
  const item = await prisma.libraryBook.create({
    data: req.body,
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'LibraryBook created successfully', data: item });
});

export const updateLibraryBook = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.libraryBook.update({
    where: { id },
    data: req.body,
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'LibraryBook updated successfully', data: item });
});

export const deleteLibraryBook = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.libraryBook.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'LibraryBook deleted successfully' });
});
