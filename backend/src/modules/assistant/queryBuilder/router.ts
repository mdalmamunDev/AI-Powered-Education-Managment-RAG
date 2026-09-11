// ─────────────────────────────────────────────────────────────
// router.ts — orchestrates the NL → structured query pipeline:
//   classify → extract → compile → format answer
// Falls back to null (controller handles semantic RAG) when
// the question is not analytics or the pipeline fails.
// ─────────────────────────────────────────────────────────────

import { chat, chatJson, classify } from '../../../helpers/ollama';
import { executeQuery, AnalyticsQuery, QueryResult, QueryValidationError } from './compiler';
import { CATALOG } from './catalog';

// ── Catalog description for the extraction prompt ───────────

function buildCatalogDescription(): string {
  return CATALOG.map((t) => {
    const fields = t.fields.map((f) => `${f.path} (${f.type})`).join(', ');
    const groupable = t.groupable.length ? ` | groupBy: ${t.groupable.join(', ')}` : '';
    const agg = t.aggregatable.length ? ` | aggregate: ${t.aggregatable.join(', ')}` : '';
    return `- ${t.name} [aliases: ${t.aliases.join(', ')}]: ${fields}${groupable}${agg}`;
  }).join('\n');
}

// ── Extract structured query from natural language ──────────

// Renders prior turns as a labeled transcript so extraction and answer
// formatting can resolve referents ("which one?", "and for the teachers?")
// and stay consistent with the conversation.
function buildTranscript(history: { role: string; content: string }[] = []): string {
  return history
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
}

async function extractQuery(question: string, history: { role: string; content: string }[] = []): Promise<AnalyticsQuery> {
  const catalogDesc = buildCatalogDescription();

  const systemPrompt =
    'You convert natural language questions about a university database into structured JSON queries.\n\n' +
    'Available data models and fields:\n' + catalogDesc + '\n\n' +
    'Query JSON schema:\n' +
    '{\n' +
    '  "target": "<model name or alias>",\n' +
    '  "action": "count" | "list" | "aggregate",\n' +
    '  "filters": [{ "field": "<field path>", "op": "<operation>", "value": "<value>" }],\n' +
    '  "groupBy": ["<field path>"],\n' +
    '  "aggregate": { "field": "<field path>", "op": "count"|"sum"|"avg"|"min"|"max" },\n' +
    '  "sort": { "field": "<field path>", "order": "asc"|"desc" },\n' +
    '  "limit": <number>\n' +
    '}\n\n' +
    'Operations (op): eq, neq, contains, gt, gte, lt, lte, in, between\n' +
    '- Use "contains" for text searches (partial match, case-insensitive)\n' +
    '- Use "eq" for exact matches (status, enums, IDs)\n' +
    '- Use "between" with an array [min, max] for ranges\n' +
    '- Use "in" with an array for multiple values\n\n' +
    'Rules:\n' +
    '- "count" returns a number. Use for "how many" questions.\n' +
    '- "list" returns matching records. Use for "list all", "show me", "which" questions.\n' +
    '- "aggregate" returns grouped/summarized data. Use for "per", "grouped by", "average", "total" questions.\n' +
    '- For "aggregate" with grouping, use groupBy (e.g., group by courseId to see "per course").\n' +
    '- For relation fields, use the field path directly (e.g., "course.courseName" to filter by course name).\n' +
    '- For groupBy on relations, use the FK field (e.g., "courseId" to group by course).\n' +
    '- Default limit for "list" is 20. Use higher limits (up to 100) when the user asks for "all".\n' +
    '- For "top N" questions, use sort + limit.\n\n' +
    'Respond with ONLY the JSON query, no explanation.';

  const transcript = buildTranscript(history);
  const userContent = transcript
    ? `Previous conversation:\n${transcript}\n\nQuestion: ${question}`
    : question;

  const result = await chatJson([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ]);

  return result as AnalyticsQuery;
}

// ── Format query result into natural language ────────────────

async function formatAnswer(
  question: string,
  history: { role: string; content: string }[],
  query: AnalyticsQuery,
  result: QueryResult
): Promise<string> {
  const systemPrompt =
    'You are a university assistant. Convert the following query result into a clear, concise natural language answer.\n\n' +
    'Rules:\n' +
    '- Be direct and factual.\n' +
    '- For counts, state the number clearly.\n' +
    '- For lists, summarize the items (e.g., "There are 3 students: Alice, Bob, Charlie").\n' +
    '- For aggregates, present the breakdown clearly.\n' +
    '- If the result is empty, say "No records found."\n' +
    '- Do not mention the query or database details.';

  const transcript = buildTranscript(history);
  const userMessage = transcript
    ? `Previous conversation:\n${transcript}\n\nQuestion: ${question}\nQuery: ${JSON.stringify(query)}\nResult: ${JSON.stringify(result.data)}`
    : `Question: ${question}\nQuery: ${JSON.stringify(query)}\nResult: ${JSON.stringify(result.data)}`;

  return await chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]);
}

// ── Public entry point ──────────────────────────────────────

export async function tryAnalytics(
  question: string,
  history: { role: string; content: string }[] = []
): Promise<{ answer: string; sources: any[] } | null> {
  // 1. Classify
  const intent = await classify(question);
  console.log('intent:', intent);
  if (intent !== 'analytics') return null;

  try {
    // 2. Extract structured query
    const query = await extractQuery(question, history);
    console.log('query:', query);

    // 3. Compile & execute
    const result = await executeQuery(query);
    console.log('result:', result);
    // 4. Format answer
    const answer = await formatAnswer(question, history, query, result);
    console.log('answer:', answer);

    return {
      answer,
      sources: [{ sourceType: 'analytics', content: 'Structured database query' }],
    };
  } catch (error) {
    if (error instanceof QueryValidationError) {
      console.error('[NL Query Engine] Validation error:', error.message);
    } else {
      console.error('[NL Query Engine] Unexpected error:', error);
    }
    return null; // signal to fall back to semantic
  }
}
