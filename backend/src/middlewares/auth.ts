import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import catchAsync from '../helpers/catchAsync';
import ApiError from '../helpers/ApiError';
import { prisma } from '../../prisma/prisma';

// Usage: auth() for any logged-in user, auth('ADMIN') to also require a role.
const auth = (...roles: string[]) =>
  catchAsync(async (req: any, res: Response, next: NextFunction) => {
    const tokenWithBearer = req.headers.authorization;
    if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer ')) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }

    const token = tokenWithBearer.split(' ')[1];
    const verified = jwt.verify(token, process.env.JWT_SECRET as Secret) as JwtPayload;

    const user = await prisma.user.findUnique({ where: { id: verified.id } });
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found.');
    }

    if (roles.length && !roles.includes(user.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to perform this action.');
    }

    req.user = user;
    next();
  });

export default auth;
