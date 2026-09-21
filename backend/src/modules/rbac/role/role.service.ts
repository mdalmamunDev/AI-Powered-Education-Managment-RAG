import { prisma } from "../../../../prisma/prisma";
import { getOrSetCache } from "../../../helpers/redis.service";

export const getPermissionsByRole = async (userRole: string): Promise<Set<string>> => {
  // Cache the plain string[] — a Set does NOT survive JSON round-trips
  // (JSON.stringify(new Set([...])) === "{}", so a cached Set would come back
  // as a plain object and .has() would throw). The Set is rebuilt from the
  // parsed array on every call, cache hit or not.
  const { data, cached } = await getOrSetCache<string[]>(
    `role:${userRole}:permission-keys`,
    async () => {
      const role = await prisma.role.findUnique({ where: { title: userRole } });
      return role?.permissionKeys ?? [];
    },
    3600,
  );

  console.log(`Permissions by role(${userRole}) fetched using cached?`, cached);

  return new Set(data);
};
