import { StatusCodes } from 'http-status-codes';
import { sendResponse, getPagination, buildPaginationMeta, normalizeDateFields } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';
import { safeEnqueueEmbedding, deleteEmbeddings } from '../embedding/helper';

export const getAllSubmissions = catchAsync(async (req: any, res: any) => {
  const { page, limit, skip, take, sortBy = 'submissionDate', sortOrder = 'desc' } = getPagination(req.query);
  const search = req.query.search as string | undefined;

  const where = {};

  const [items, totalCount] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
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
    data: normalizeDateFields(req.body, ['submissionDate']),
    include: { assignment: true, student: true },
  });
  await safeEnqueueEmbedding('submission', item.id, item);
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Submission created successfully', data: item });
});

export const updateSubmission = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  const item = await prisma.submission.update({
    where: { id },
    data: normalizeDateFields(req.body, ['submissionDate']),
    include: { assignment: true, student: true },
  });
  await safeEnqueueEmbedding('submission', item.id, item);
  sendResponse(res, { code: StatusCodes.OK, message: 'Submission updated successfully', data: item });
});

export const deleteSubmission = catchAsync(async (req: any, res: any) => {
  const id = Number(req.params.id);
  await prisma.submission.delete({ where: { id } });
  await deleteEmbeddings('submission', id);
  sendResponse(res, { code: StatusCodes.OK, message: 'Submission deleted successfully' });
});
