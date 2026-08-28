import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

export const getAllSubmissions = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = {};

  const [items, totalCount] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take,
      orderBy: { submissionDate: 'desc' },
      include: { assignment: true, student: true },
    }),
    prisma.submission.count({ where }),
  ]);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: items,
    pagination: buildPaginationMeta(totalCount, page, limit),
  });
});

export const getSubmissionById = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.submission.findUnique({
    where: { id },
    include: { assignment: true, student: true },
  });
  if (!item) throw new ApiError(StatusCodes.NOT_FOUND, 'Submission not found.');
  sendResponse(res, { code: StatusCodes.OK, data: item });
});

export const createSubmission = catchAsync(async (req: any, res: any) => {
  const item = await prisma.submission.create({
    data: req.body,
    include: { assignment: true, student: true },
  });
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Submission created successfully', data: item });
});

export const updateSubmission = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.submission.update({
    where: { id },
    data: req.body,
    include: { assignment: true, student: true },
  });
  sendResponse(res, { code: StatusCodes.OK, message: 'Submission updated successfully', data: item });
});

export const deleteSubmission = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.submission.delete({ where: { id } });
  sendResponse(res, { code: StatusCodes.OK, message: 'Submission deleted successfully' });
});
