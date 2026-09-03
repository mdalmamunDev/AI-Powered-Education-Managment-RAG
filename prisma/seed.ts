import { prisma } from './prisma';
import { seedAcademic } from './seed/academic.seed';
import { seedAdvising } from './seed/advising.seed';
import { seedAuth } from './seed/auth.seed';
import { seedLibrary } from './seed/library.seed';
import { seedOperations } from './seed/operations.seed';
import { seedProgress } from './seed/progress.seed';

async function main() {
  await seedAuth();
  const academic = await seedAcademic();

  await seedProgress(academic);
  await seedOperations(academic);
  await seedAdvising(academic);
  await seedLibrary(academic);

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
