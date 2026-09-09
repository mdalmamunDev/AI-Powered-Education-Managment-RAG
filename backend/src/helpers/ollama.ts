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