// Shared history guards for the chat pipeline. History is client-supplied so
// it is validated/trimmed both before it enters the queue (controller) and
// again inside the worker (defense in depth against bad queued payloads).

export const HISTORY_LIMIT = 16; // 8 exchanges = 16 turns
export const MESSAGE_CHAR_LIMIT = 4000; // per-message cap for LLM context

export function sanitizeHistory(raw: any): { role: string; content: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m) =>
        m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant')
    )
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content.slice(0, MESSAGE_CHAR_LIMIT),
    }))
    .slice(-HISTORY_LIMIT);
}