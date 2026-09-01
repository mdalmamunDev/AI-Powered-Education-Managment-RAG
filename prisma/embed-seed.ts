import { prisma } from './prisma';
import { embed } from '../src/helpers/ollama';

async function ingest(sourceType: string, id: number, text: string) {
  if (!text) return;
  const vector = await embed(text);
  const vectorLiteral = `[${vector.join(',')}]`;
  await prisma.$executeRaw`
    INSERT INTO "Embedding" ("sourceType", "sourceId", "content", "embedding")
    VALUES (${sourceType}, ${id}, ${text}, ${vectorLiteral}::vector)
  `;
}

async function main() {
  const courses = await prisma.course.findMany();
  for (const c of courses) {
    await ingest('course', c.id, `${c.courseName} (${c.courseCode}): ${c.description ?? ''}`);
  }

  const assignments = await prisma.assignment.findMany();
  for (const a of assignments) {
    await ingest('assignment', a.id, `${a.title}: ${a.description ?? ''}`);
  }

  const books = await prisma.libraryBook.findMany();
  for (const b of books) {
    await ingest('libraryBook', b.id, `${b.title} by ${b.author}, category: ${b.category ?? ''}`);
  }

  console.log('Embedding ingestion complete.');
}

main().finally(() => prisma.$disconnect());