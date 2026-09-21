import { prisma } from "../../../../prisma/prisma";
import { getOrSetCache } from "../../../helpers/redis.service";

export const getPermissionsByRole = async (userRole: string): Promise<Set<String>> => {
  const { data, cached } = await getOrSetCache(`role:${userRole}:permission-set`, async () => {
    const role = await prisma.role.findUnique({ where: { title: userRole } });
    return new Set(role?.permissionKeys || [])
  }, 3600)

  console.log(`Permissions by role(${userRole}) fetched using cached?`, cached)
  
  return data;
}