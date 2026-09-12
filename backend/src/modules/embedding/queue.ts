import IORedis from 'ioredis';
import { Queue } from 'bullmq';

export interface EmbeddingJobData {
  sourceType: string;
  sourceId: number;
  content: string;
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Dedicated connection for the embedding queue (BullMQ recommends one
// connection per worker, so this stays separate from the chat queue).
export const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const embeddingQueue = new Queue<EmbeddingJobData>('embedding', { connection });

export async function enqueueEmbedding(data: EmbeddingJobData) {
  await embeddingQueue.add('embed', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}