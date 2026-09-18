import { StatusCodes } from "http-status-codes";
import catchAsync from "../../helpers/catchAsync";
import { sendResponse } from "../../helpers/globals";
import { prisma } from "../../../prisma/prisma";

export const getRbacDash = catchAsync(async (req: any, res: any) => {
  // get all roles

  const [roles, modules, permissions] = await Promise.all([
    prisma.role.findMany(),
    prisma.module.findMany(),
    await prisma.permission.findMany({
      select: {
        key: true,
      },
    })
  ])


  const permissionKeys = permissions.map((permission) => permission.key);
  
sendResponse(res, { code: StatusCodes.OK, data: { roles, modules, permissions, permissionKeys } });
});