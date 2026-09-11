import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../helpers/catchAsync';
import { sendResponse } from '../../helpers/globals';
import { embed, chat, rewriteForSearch } from '../../helpers/ollama';
import { prisma } from '../../../prisma/prisma';
import { tryAnalytics } from './queryBuilder/router';

// How much conversation we trust from the client (8 exchanges = 16 turns).
const HISTORY_LIMIT = 16;
// Per-message char cap so a long paste can't blow out the LLM context window.
const MESSAGE_CHAR_LIMIT = 4000;

// Only well-formed user/assistant turns pass through, newest N kept.
function sanitizeHistory(raw: any): { role: string; content: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content.slice(0, MESSAGE_CHAR_LIMIT) }))
    .slice(-HISTORY_LIMIT);
}

export const ask = catchAsync(async (req: any, res: any) => {
  const { question } = req.body;
  const history = sanitizeHistory(req.body.history);

  // Make the question standalone so intent classification, embedding, and
  // retrieval all resolve pronouns/referents from earlier turns.
  const searchQuestion = await rewriteForSearch(question, history);

  // 1. Try structured analytics query first (fast, deterministic)
  const analyticsResult = await tryAnalytics(searchQuestion, history);
  if (analyticsResult) {
    sendResponse(res, { code: StatusCodes.OK, data: analyticsResult });
    return;
  }

  // 2. Fall back to semantic RAG (embedding + vector search + LLM)
  const queryVector = await embed(searchQuestion);
  const vectorLiteral = `[${queryVector.join(',')}]`;

  // pgvector's <=> operator is cosine distance — smaller is more similar
  const matches: any[] = await prisma.$queryRaw`
    SELECT content, "sourceType", "sourceId"
    FROM "Embedding"
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT 5
  `;

  const context = matches.map((m) => `- ${m.content}`).join('\n');

  // Generation sees the full conversation (history) plus the retrieved
  // context; answer the original question, not the rewrite.
  const messages: { role: string; content: string }[] = [
    {
      role: 'system',
      content: `You are the assistant for a university's education management system. Answer only using the context below. If the answer isn't in the context, say you don't know.\n\nContext:\n${context}`,
    },
    ...history,
    { role: 'user', content: question },
  ];

  const answer = await chat(messages);

  sendResponse(res, { code: StatusCodes.OK, data: { answer, sources: matches } });
});