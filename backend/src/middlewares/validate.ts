import { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodType } from 'zod';
import ApiError from '../helpers/ApiError';
import catchAsync from '../helpers/catchAsync';

// Flattens a ZodError into one readable message for ApiError,
// e.g. "Validation failed: title: A role title is required."
export const formatZodError = (error: ZodError): string =>
  `Validation failed: ${error.issues
    .map((issue) => `${issue.path.length ? issue.path.join('.') : 'body'}: ${issue.message}`)
    .join('; ')}`;

// Usage: validate(schema) — parses req.body against the zod schema.
// On success the validated value (transformed + unknown keys stripped)
// replaces req.body and the request continues; on failure a 400 ApiError
// is thrown and handled by the global error handler.
const validate =
  (schema: ZodType): RequestHandler =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, formatZodError(parsed.error));
    }
    req.body = parsed.data;
    next();
  });

export default validate;
