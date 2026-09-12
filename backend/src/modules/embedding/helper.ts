import { enqueueEmbedding } from './queue';
import { embeddableContent } from './content';
import { prisma } from '../../../prisma/prisma';

// Pushes a record's embedding job onto BullMQ. Never throws — create/update
// must succeed even if Redis or Ollama is down; we just log and skip the vector.
export async function safeEnqueueEmbedding(sourceType: string, sourceId: number, record: any) {
  try {
    const content = embeddableContent(sourceType, record);
    if (!content || !content.trim()) return;
    await enqueueEmbedding({ sourceType, sourceId, content });
  } catch (error: any) {
    console.error(`[embedding] enqueue failed for ${sourceType}#${sourceId}:`, error?.message);
  }
}

// Removes the stored vector for a deleted record (no queue needed — one query).
export async function deleteEmbeddings(sourceType: string, sourceId: number) {
  try {
    await prisma.$executeRaw`
      DELETE FROM "Embedding" WHERE "sourceType" = ${sourceType} AND "sourceId" = ${sourceId}
    `;
  } catch (error: any) {
    console.error(`[embedding] delete failed for ${sourceType}#${sourceId}:`, error?.message);
  }
}