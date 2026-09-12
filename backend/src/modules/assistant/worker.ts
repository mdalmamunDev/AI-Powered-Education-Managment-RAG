import { Worker, Job } from 'bullmq';
import { connection } from './queue';
import { emitToUser } from '../../helpers/socket';
import { sanitizeHistory } from './history';
import { rewriteForSearch, embed, chatStream } from '../../helpers/ollama';
import { tryAnalytics } from './queryBuilder/router';
import { ChatProgress } from './progress';
import { prisma } from '../../../prisma/prisma';

// Runs the full chat pipeline for one queued job and pushes live progress +
// streamed tokens to the requesting user over Socket.IO.
// `concurrency: 1` in `startChatWorker` guarantees only ONE chat is generated
// at a time — every other user waits their turn in the BullMQ queue.
async function processChatJob(
  userId: number,
  requestId: string,
  question: string,
  history: { role: string; content: string }[]
) {
  const emit = (event: string, payload: any) =>
    emitToUser(userId, event, { requestId, ...payload });

  const progress: ChatProgress = {
    stage: (stage, extra = {}) => emit('chat:progress', { stage, ...extra }),
    token: (token) => token && emit('chat:token', { token }),
  };

  const sanitized = sanitizeHistory(history);

  // Make the question standalone so intent classification, embedding, and
  // retrieval all resolve pronouns/referents from earlier turns.
  progress.stage('rewriting');
  const searchQuestion = await rewriteForSearch(question, sanitized);

  // 1. Try structured analytics first (emits understanding -> querying -> generating)
  const analyticsResult = await tryAnalytics(searchQuestion, sanitized, progress);
  if (analyticsResult) {
    progress.stage('done');
    emit('chat:done', {
      answer: analyticsResult.answer,
      sources: analyticsResult.sources,
      decode: {
        "step_1:sanitized": sanitized,
        "step_2:searchQuestion": searchQuestion,
        "step_3:analyticsResult": analyticsResult
      }
    });
    return;
  }

  // 2. Fall back to semantic RAG (embedding + vector search + streamed LLM)
  progress.stage('searching');
  const queryVector = await embed(searchQuestion);
  const vectorLiteral = `[${queryVector.join(',')}]`;

  const matches: any[] = await prisma.$queryRaw`
    SELECT content, "sourceType", "sourceId"
    FROM "Embedding"
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT 5
  `;

  const context = matches.map((m: any) => `- ${m.content}`).join('\n');

  progress.stage('generating');
  const messages: { role: string; content: string }[] = [
    {
      role: 'system',
      content: `You are the assistant for a university's education management system. Answer only using the context below. If the answer isn't in the context, say you don't know.\n\nContext:\n${context}`,
    },
    ...sanitized,
    { role: 'user', content: question },
  ];

  const answer = await chatStream(messages, (token) => progress.token(token));

  progress.stage('done');
  emit('chat:done', {
    answer,
    sources: matches,
    decode: {
      "step_1:sanitized": sanitized,
      "step_2:searchQuestion": searchQuestion,
      "step_3:analyticsResult": analyticsResult,
      "step_4:queryVector": queryVector,
      "step_5:matches": matches,
      "step_6:answer": answer
    }
  });
}

export function startChatWorker() {
  const worker = new Worker<{ userId: number; requestId: string; question: string; history: any }, any, string>(
    'assistant-chat',
    async (job: Job) => {
      const { userId, requestId, question, history } = job.data;
      try {
        await processChatJob(userId, requestId, question, history);
      } catch (error: any) {
        console.error(`[chat-worker] job ${job.id} failed:`, error?.message);
        // Tell the user what happened, then rethrow so BullMQ records the failure.
        emitToUser(userId, 'chat:error', {
          requestId,
          message: 'Sorry, something went wrong while answering your question. Please try again.',
        });
        throw error;
      }
    },
    // ── The whole point of the queue: only one chat at a time. ──
    { connection, concurrency: 1 }
  );

  worker.on('completed', (job) => {
    console.log(`[chat-worker] completed job ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[chat-worker] job ${job?.id} failed event:`, err?.message);
  });

  return worker;
}