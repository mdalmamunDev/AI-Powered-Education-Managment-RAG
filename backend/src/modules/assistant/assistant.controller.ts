import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../helpers/catchAsync';
import { sendResponse } from '../../helpers/globals';
import { embed, chat } from '../../helpers/ollama';
import { prisma } from '../../../prisma/prisma';

export const ask = catchAsync(async (req: any, res: any) => {
  const { question } = req.body;

  const queryVector = await embed(question);
  const vectorLiteral = `[${queryVector.join(',')}]`;

  // pgvector's <=> operator is cosine distance — smaller is more similar
  const matches: any[] = await prisma.$queryRaw`
    SELECT content, "sourceType", "sourceId"
    FROM "Embedding"
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT 5
  `;

  const context = matches.map((m) => `- ${m.content}`).join('\n');

  const answer = await chat([
    {
      role: 'system',
      content: `You are the assistant for a university's education management system. Answer only using the context below. If the answer isn't in the context, say you don't know.\n\nContext:\n${context}`,
    },
    { role: 'user', content: question },
  ]);

  sendResponse(res, { code: StatusCodes.OK, data: { answer, sources: matches } });
});