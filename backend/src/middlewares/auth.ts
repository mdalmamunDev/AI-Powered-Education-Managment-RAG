import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import catchAsync from '../helpers/catchAsync';
import ApiError from '../helpers/ApiError';
import { prisma } from '../../prisma/prisma';

// Usage: auth() for any logged-in user, auth('department.read') to also require
// a permission key (several keys are alternatives — any one of them passes).
const auth = (...permissions: string[]) =>
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

    req.user = user;

    if (permissions.length) {
      // User.role holds the role title (Role.title), which carries the keys
      // granted on the RBAC page, e.g. "department.read".
      // Keep this an exact match: register() lets callers store an arbitrary
      // role title, so a loose (case-insensitive) lookup could hand out
      // permissions the stored role was never granted.
      const role = await prisma.role.findUnique({ where: { title: user.role } });
      const granted = new Set(role?.permissionKeys || []);

      const allowed = permissions.some((permission) => granted.has(permission));
      if (!allowed) {
        const requirement =
          permissions.length === 1 ? permissions[0] : `one of ${permissions.join(', ')}`;
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `You do not have permission to perform this action (requires ${requirement}).`,
        );
      }
    }

    next();
  });

export default auth;
