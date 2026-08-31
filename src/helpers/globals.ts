import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

type IData<T> = {
  code: number;
  message?: string;
  data?: T;
  pagination?: {
    totalCount?: number;
    totalPages?: number;
    currentPage?: number;
    itemsPerPage?: number;
  };
  extra?: any;
};

export const sendResponse = <T>(res: Response, data: IData<T>) => {
  res.status(data.code).json({
    code: data.code,
    message: data.message,
    data: data.data,
    pagination: data.pagination,
    extra: data.extra,
  });
};

// Reads ?page= & ?limit= from the query string and returns Prisma skip/take
// plus the values needed to build a pagination block for the response.
export const getPagination = (query: any) => {
  const page = Math.max(parseInt(query.page as string, 10) || 1, 1);
  const limit = Math.max(parseInt(query.limit as string, 10) || 10, 1);
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
};

export const buildPaginationMeta = (totalCount: number, page: number, limit: number) => ({
  totalCount,
  totalPages: Math.ceil(totalCount / limit),
  currentPage: page,
  itemsPerPage: limit,
});

// Normalizes date-like values before they reach Prisma.
// - A bare "YYYY-MM-DD" (no time component) becomes an ISO timestamp at UTC
//   midnight so the calendar date round-trips unchanged regardless of the
//   server/client timezone.
// - A full ISO-8601 string is parsed into a Date object.
// - Anything else (already a Date, empty, or unparseable) is returned as-is so
//   Prisma still performs its own validation/error reporting.
export const toIsoDate = (value: any): any => {
  if (value === undefined || value === null || value instanceof Date) return value;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  // Date-only input, e.g. "2026-08-12" -> 2026-08-12T00:00:00.000Z
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`);
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
};

// Copies an incoming request body and applies toIsoDate to a set of date
// fields, so date-only values like "2026-08-12" are normalized to an explicit
// UTC-midnight ISO timestamp before they reach Prisma. Absent/null fields are
// left untouched; invalid values still flow through so Prisma reports them.
export const normalizeDateFields = (body: any, fields: string[]): any => {
  const data = { ...body };
  for (const field of fields) {
    if (data[field] !== undefined) data[field] = toIsoDate(data[field]);
  }
  return data;
};

export const formatError = (error: any) => {
  // Prisma unique constraint violation (e.g. duplicate email/ISBN/course code)
  if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
    const fields = Array.isArray(error.meta?.target)
      ? (error.meta!.target as string[]).join(', ')
      : typeof error.meta?.target === 'string'
      ? error.meta.target
      : 'field';
    return { code: 400, message: `A record with the same ${fields} already exists.` };
  }

  // Prisma "record not found" (update/delete on a missing id, or a bad FK)
  if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
    return { code: 404, message: 'Record not found.' };
  }

  // Prisma foreign key constraint failure (referencing a non-existent related record)
  if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
    return { code: 400, message: 'Invalid reference: related record does not exist.' };
  }

  if (error.code && typeof error.code === 'number') {
    return { code: error.code, message: error.message || 'Something went wrong' };
  }

  return {
    code: 500,
    message: error.message || 'Something went wrong',
    data: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };
};
