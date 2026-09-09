const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL;
const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL;

export async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: 'POST',
    body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, input: text }),
  });
  const data: any = await res.json();
  return data.embeddings[0]; // /api/embed batches, so it returns an array of vectors
}

export async function chat(messages: { role: string; content: string }[]) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    body: JSON.stringify({ model: OLLAMA_CHAT_MODEL, messages, stream: false }),
  });
  const data: any = await res.json();
  return data.message.content;
}

// ── JSON-mode helpers for the NL query engine ───────────────

export async function chatJson(messages: { role: string; content: string }[]): Promise<any> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    body: JSON.stringify({ model: OLLAMA_CHAT_MODEL, messages, stream: false, format: 'json' }),
  });
  if (!res.ok) throw new Error(`Ollama chat (json) failed: ${res.status}`);
  const data: any = await res.json();
  const content: string = data.message?.content ?? '';
  try {
    return JSON.parse(content);
  } catch {
    // Try to extract JSON from markdown code blocks
    const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1]);
    // Try to find a JSON object in the text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('LLM did not return valid JSON');
  }
}

const ANALYTICS_KEYWORDS = [
  'how many', 'count', 'total', 'average', 'avg', 'sum',
  'list all', 'show all', 'list the', 'show me all',
  ' per ', 'grouped by', 'group by',
  'top ', 'most', 'least', 'highest', 'lowest',
  'more than', 'less than', 'greater than', 'fewer than',
  'enrolled', 'teaches', 'teach', 'taking',
  'grades', 'payments', 'attendance',
  'which students', 'what courses', 'who is',
  'number of', 'percentage', 'breakdown',
];

export async function classify(question: string): Promise<'analytics' | 'semantic'> {
  const lower = question.toLowerCase();

  // Fast keyword pre-check
  for (const kw of ANALYTICS_KEYWORDS) {
    if (lower.includes(kw)) return 'analytics';
  }

  // LLM fallback for ambiguous questions
  try {
    const result = await chatJson([
      {
        role: 'system',
        content:
          'Classify the user\'s question into one of two intents:\n' +
          '- "analytics": questions answerable by querying structured database records (counts, lists, aggregations, filters, groupings). E.g., "How many courses?", "List students in CS", "Average grade per course".\n' +
          '- "semantic": questions requiring search through unstructured text (descriptions, notes, policies, explanations). E.g., "What is the syllabus about?", "Explain the grading policy".\n\n' +
          'Respond with ONLY a JSON object: {"intent": "analytics"} or {"intent": "semantic"}.',
      },
      { role: 'user', content: question },
    ]);
    return result.intent === 'analytics' ? 'analytics' : 'semantic';
  } catch {
    return 'semantic'; // default to semantic on error
  }
}