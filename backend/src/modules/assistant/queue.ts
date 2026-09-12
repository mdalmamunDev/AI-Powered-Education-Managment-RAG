import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../helpers/ApiError';

export interface ChatJobData {
  userId: number;
  requestId: string;
  question: string;
  history: { role: string; content: string }[];
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// BullMQ requires maxRetriesPerRequest: null on shared connections so the
// worker can block waiting for new jobs.
export const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const chatQueue = new Queue<ChatJobData>('assistant-chat', { connection });

// Adds a chat job and reports where the caller sits in line.
export async function enqueueChat(data: ChatJobData) {
  try {
    const job = await chatQueue.add('chat', data, {
      attempts: 1,
      removeOnComplete: 100,
      removeOnFail: 100,
    });
    const [waiting, active] = await Promise.all([
      chatQueue.getWaitingCount(),
      chatQueue.getActiveCount(),
    ]);
    return { jobId: job.id, requestId: data.requestId, position: waiting + active + 1 };
  } catch (error: any) {
    console.error('[chat-queue] enqueue failed:', error?.message);
    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      'The AI chat queue is unavailable right now (is Redis running?). Please try again shortly.'
    );
  }
}