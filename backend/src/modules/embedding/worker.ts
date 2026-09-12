import { Worker, Job } from 'bullmq';
import { connection, EmbeddingJobData } from './queue';
import { embed } from '../../helpers/ollama';
import { prisma } from '../../../prisma/prisma';

async function processEmbeddingJob({ sourceType, sourceId, content }: EmbeddingJobData) {
  const text = (content || '').trim();
  if (!text) return;

  const vector = await embed(text);
  const vectorLiteral = `[${vector.join(',')}]`;

  // Replace any previous embedding for this record (keeps updates clean).
  await prisma.$transaction([
    prisma.$executeRaw`
      DELETE FROM "Embedding" WHERE "sourceType" = ${sourceType} AND "sourceId" = ${sourceId}
    `,
    prisma.$executeRaw`
      INSERT INTO "Embedding" ("sourceType", "sourceId", "content", "embedding")
      VALUES (${sourceType}, ${sourceId}, ${text}, ${vectorLiteral}::vector)
    `,
  ]);
}

export function startEmbeddingWorker() {
  const worker = new Worker<EmbeddingJobData, any, string>(
    'embedding',
    async (job: Job) => {
      try {
        await processEmbeddingJob(job.data);
      } catch (error: any) {
        console.error(
          `[embedding-worker] job ${job.id} failed (${job.data?.sourceType}#${job.data?.sourceId}):`,
          error?.message
        );
        throw error;
      }
    },
    { connection, concurrency: 1 }
  );

  worker.on('completed', (job) => {
    console.log(`[embedding-worker] completed job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[embedding-worker] job ${job?.id} failed event:`, err?.message);
  });

  return worker;
}