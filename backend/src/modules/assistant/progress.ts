// Progress handle threaded through the chat pipeline. The worker wires these
// callbacks to Socket.IO so the requesting user sees live stage/token updates.

export interface ChatProgress {
  /** Emits a named stage, e.g. "rewriting" | "understanding" | "querying" | "searching" | "generating". */
  stage: (name: string, extra?: any) => void;
  /** Emits a streamed answer token from the final LLM generation. */
  token: (text: string) => void;
}