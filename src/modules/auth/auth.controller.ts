import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from '../../helpers/globals';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../helpers/ApiError';
import { prisma } from '../../../prisma/prisma';

const signToken = (id: number) =>
  jwt.sign({ id }, process.env.JWT_SECRET as Secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });

export const register = catchAsync(async (req: any, res: any) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'name, email and password are required.');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role === 'ADMIN' ? 'ADMIN' : 'STAFF' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken(user.id);
  sendResponse(res, { code: StatusCodes.CREATED, message: 'Registered successfully', data: { user, token } });
});

export const login = catchAsync(async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'email and password are required.');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password.');
  }

  const token = signToken(user.id);
  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Logged in successfully',
    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token },
  });
});

export const me = catchAsync(async (req: any, res: any) => {
  sendResponse(res, {
    code: StatusCodes.OK,
    data: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
  });
});
