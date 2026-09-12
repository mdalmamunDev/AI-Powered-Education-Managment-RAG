# 🤖 EduTech AI — Chat & RAG System (Deep Dive)

A detailed, implementation-level guide to the AI assistant built into the EduTech
Education Management System. It walks through everything that happens when a user
asks a question — from the chat widget in the browser, into the **BullMQ** queue,
through either the **NL → structured analytics** pipeline or the **semantic RAG**
pipeline, past a local **Ollama** model, and back to the user as a **live-streamed
answer** with real-time **Socket.IO stage updates**.

> 🧠 **All AI inference runs locally.** No third-party AI provider is involved —
> embeddings and chat generation are served by Ollama on your own machine.

---

## 1. High-level architecture

```
┌──────────────────────────┐          ┌────────────────────────────────────────────────────┐
│  Vue 3 admin dashboard   │          │                 Node.js backend                    │
│  (AiChatWidget.vue)      │          │                                                    │
│  • shows stages / tokens │  REST    │  ┌──────────────────────────────────────────┐      │
│  • streams answer bubble │ POST     │  │ POST /api/v1/assistant/ask               │      │
│  • Socket.IO client      │────────▶│  │ (JWT auth) → enqueueChat() → 202          │      │
│                          │          │  └────────────────────┬─────────────────────┘      │
│                          │          │                       ▼                            │
│                          │          │  ┌──────────────────────────────────────────┐      │
│                          │          │  │ BullMQ queue "assistant-chat" (Redis)    │      │
│                          │          │  │ concurrency: 1 ── one chat at a time     │      │
│                          │          │  └────────────────────┬─────────────────────┘      │
│                          │          │                       ▼                            │
└───────────┬──────────────┘          │  ┌──────────────────────────────────────────┐      │
            │ Socket.IO (same port,   │  │ worker.ts — full pipeline                │      │
            │ JWT-authed, room        │  │  rewriting → understanding →             │      │
            │ "user:{id}")            │  │  querying / searching → generating → done│      │
            │                         │  └───┬────────────┬───────────────────────┬─┘      │
            ▼                         │      │            │                       │        │
  live events ◀──────────────────────┼──────┘            ▼                       ▼        |
  • chat:progress                     │              ┌───────────┐      ┌──────────────────┐   
  • chat:token    ◀──────────────────┼──────────────│  Ollama   │      │ Postgre          │
  • chat:done                         │              │ embed/chat│      │ pgvector         │
  • chat:error                        │              │ (stream)  │─────▶│ Embedding (768d) │
                                      │              └───────────┘      │ cosine top-5     │
                                      │            Redis (queue)         └─────────────────┘
                                      └────────────────────────────────────────────────────┘
```

**Components at a glance**

| Component | Role |
|---|---|
| `AiChatWidget.vue` | Floating chat UI in the admin panel; opens the socket, shows queue position + stage, streams the answer into a bubble |
| `POST /api/v1/assistant/ask` | The **only** chat endpoint. Validates the question, sanitizes history, enqueues a job, and returns **202 Accepted** with `{ jobId, requestId, position }` immediately |
| BullMQ queue + worker | Serializes generation so only **one chat runs at a time**; everyone else waits in FIFO order |
| Analytics pipeline (`queryBuilder/*`) | Structured-data questions ("How many students?", "Top courses by enrollment") → **validated Prisma queries** — fast and deterministic |
| Semantic RAG pipeline | Everything else → embedding + pgvector similarity search + grounded LLM answer |
| Ollama | Local embedding model (`nomic-embed-text`) and chat model (`qwen2.5-coder`) |
| PostgreSQL + pgvector | Stores 768-dim embeddings; cosine distance search (`<=>`) |
| Redis | BullMQ queue backing store |
| Socket.IO | Pushes `chat:progress`, `chat:token`, `chat:done`, `chat:error` to the requesting user's private room |

---

## 2. The journey of a question

This is the exact order of operations for one user message.

### Step 1 — The widget connects and sends

1. The widget generates a unique **`requestId`** for this request
   (`chat_<timestamp>_<random>`).
2. It opens (or reuses) the **Socket.IO** connection using the same JWT used for
   REST calls (`socket.io-client`, `auth: { token }`).
3. It `POST`s to `/api/v1/assistant/ask` with
   `{ question, history, requestId }`.

### Step 2 — The controller enqueues and returns immediately

`assistant.controller.ts → ask()`:

- Sanitizes the client-supplied `history` (`sanitizeHistory` in `history.ts`):
  - keeps only `user` / `assistant` roles,
  - truncates every message to **4,000 chars**,
  - keeps only the **last 16 turns** (8 exchanges).
- Rejects empty questions with **400**.
- Calls `enqueueChat(...)`, which adds a BullMQ job:

| Queue option | Value | Why |
|---|---|---|
| queue name | `assistant-chat` | single purpose queue |
| `attempts` | `1` | no silent retries of expensive LLM work |
| `removeOnComplete` / `removeOnFail` | `100` | keep the last 100 jobs in Redis for debugging |

- Counts `waiting + active` jobs and replies:

```json
{ "code": 202, "data": { "jobId": "12", "requestId": "chat_1750000000_ab12cd", "position": 3 } }
```

> The HTTP request is **not** blocked on the answer — everything after this point
> arrives over the socket. `position` lets the UI show "Waiting in queue (position 3)…".

### Step 3 — The worker processes the job (one at a time)

`worker.ts → startChatWorker()` creates a BullMQ `Worker` with **`concurrency: 1`**.
Only one chat is ever generated at a time; if several users ask simultaneously,
the others wait in Redis and are picked up in FIFO order.

### Step 4 — The pipeline runs and streams

For every stage change the worker emits `chat:progress`. Once the final LLM call
runs, each generated token is forwarded with `chat:token`.

| Stage | What happens | Notes |
|---|---|---|
| `rewriting` | `rewriteForSearch()` rewrites the question to be standalone (resolves pronouns like "and for the teachers?") | Only calls Ollama when history exists; otherwise returns the question unchanged |
| `understanding` | Intent classification: analytics vs semantic | Keyword pre-check first, LLM only for ambiguous questions |
| `querying` | Analytics path: extract structured query → validate → execute Prisma query | Only when intent is `analytics` |
| `searching` | Semantic path: embed question → pgvector cosine search → top-5 chunks | Only when intent is `semantic` / analytics returned nothing |
| `generating` | Final answer generated by Ollama, **streamed token-by-token** | Both paths stream via `chat:token` |
| `done` | Job finished; `chat:done` carries the answer + sources | |

### Step 5 — The widget renders it

- `chat:progress` → update `stageText` ("Waiting in queue (position 2)…", "Searching the knowledge base…").
- `chat:token` → append text to the assistant bubble (with a blinking cursor).
- `chat:done` → finalize the bubble, show "Based on N sources", and push the turns into local history (capped at 16).
- `chat:error` or an HTTP failure → show a friendly error bubble and keep the user's message for retry context.

---

## 3. The two answer paths in detail

Every question is routed **analytics-first**. Only when the analytics pipeline
declines (non-analytics intent) — or fails validation — does the system fall back
to semantic RAG.

### 3.1 Analytics path — questions about numbers, lists and aggregates

```
question
   │  classify()   (keyword pre-check, LLM only if ambiguous)
   ▼
"analytics" ──▶ extractQuery()  ──▶  executeQuery()  ──▶  formatAnswer()
                    (LLM returns            (validated     (LLM, streamed,
                     an AnalyticsQuery        Prisma call)   natural language)
                     JSON object)
```

**Step A — `classify(question)`** (`ollama.ts`)
A fast keyword list (`how many`, `total`, `average`, `list all`, `group by`,
`top`, `which students`, `payments`, `attendance` …) returns `analytics`
immediately for the common cases. Ambiguous questions that don't match any keyword
go to the LLM (`chatJson`) which returns `{ "intent": "analytics" }` or
`{ "intent": "semantic" }`. Any failure defaults to `semantic`.

**Step B — `extractQuery(question, history)`** (`queryBuilder/router.ts`)
The LLM receives:
- a **catalog description** built from `catalog.ts` (every model, its aliases,
  fields, types, groupable/aggregatable columns),
- a strict **JSON schema** it must follow,
- the previous conversation transcript (so follow-ups like "and for the
  teachers?" resolve correctly).

It must respond with **only** a JSON `AnalyticsQuery`:

```json
{
  "target": "enrollment",
  "action": "count",
  "filters": [{ "field": "course.courseName", "op": "contains", "value": "CS" }],
  "groupBy": ["courseId"],
  "aggregate": { "field": "*", "op": "count" },
  "sort": { "field": "courseId", "order": "desc" },
  "limit": 20
}
```

**Step C — `executeQuery(query)`** (`queryBuilder/compiler.ts`)
The compiler treats `catalog.ts` as an **allow-list**:

- `findTarget()` / `findField()` reject any unknown target, field, or operation
  (`QueryValidationError`), so the LLM can never invent a table, column, or SQL.
- Supported actions:
  - `count` → `prisma.<model>.count({ where })`
  - `list` → `findMany({ where, orderBy, take })` — default limit **20**, max **100**
  - `aggregate` → `groupBy` / `aggregate` with sum/avg/min/max/count
- Date fields are normalized (`toIsoDate`) and relation paths (`course.courseName`)
  are walked into nested Prisma `where` objects.
- Relationship IDs in grouped results are resolved back to human-readable names
  (e.g. `departmentId: 2` → `Department of Computer Science`).

**Step D — `formatAnswer(...)`** (`queryBuilder/router.ts`)
The query result is formatted into a concise, factual sentence by the chat model.
This call runs through `chatStream()`, so the answer **types itself into the chat
bubble live**.

**On errors** — any validation/runtime error inside `tryAnalytics()` returns
`null`, and the worker silently falls back to the semantic path rather than
erroring out to the user.

### 3.2 Semantic RAG path — everything else

```
searchQuestion
   │ embed()  (nomic-embed-text → 768-dim vector)
   ▼
pgvector:  SELECT content, "sourceType", "sourceId"
           FROM "Embedding"
           ORDER BY embedding <=> $vector::vector   -- cosine distance
           LIMIT 5
   ▼
context = "- chunk A\n- chunk B\n- ..."
   ▼
messages = [ system: "Answer only using the context below.
                     If the answer isn't in the context, say you don't know.
                     Context: <context>",
             ...history,
             user: "original question" ]
   ▼
chatStream()  →  chat:token ... chat:token  →  chat:done { answer, sources }
```

- **Embedding** — `embed()` calls Ollama `/api/embed` with
  `OLLAMA_EMBED_MODEL` (default `nomic-embed-text`), producing a 768-dimension
  vector (matches the `vector(768)` column).
- **Retrieval** — pgvector's `<=>` operator is *cosine distance*: smaller =
  more similar. The `LIMIT 5` chunks become the grounding context.
- **Grounded generation** — the model sees *only* the retrieved context plus the
  conversation history; the system prompt forces it to say "I don't know" when the
  context has no answer (avoids hallucination).
- **Streaming** — the final call uses `chatStream()` so tokens flow to the widget
  in real time; on completion the worker sends `chat:done` with the full text and
  the `sources` array (which rows the answer was based on).

> Both paths share the same rewriter: `rewriteForSearch()` makes the user's
> question standalone before classification/embedding so pronouns in follow-up
> turns ("what about the teachers?", "which one is the highest?") still retrieve
> the right information.

---

## 4. Concurrency — how multiple users are handled

### Why a queue?

All generations flow through **one local Ollama instance**. On limited hardware a
chat model is CPU/VRAM-bound, so only one generation can realistically run at a
time. If ten users hit the endpoint simultaneously the naive approach would fire
ten Ollama calls at once — each one waiting behind the others inside Ollama's own
scheduler with **no fairness, no backpressure, and no way to tell the user what's
happening**.

The BullMQ queue solves that:

- **`concurrency: 1`** — the worker picks up jobs strictly one at a time, in FIFO
  order. This is *our* scheduler, deliberately matching the hardware's real
  capacity.
- **Precise position feedback** — the enqueue response includes
  `position = waiting + active + 1`, so the UI can say
  *"Waiting in queue (position 3)…"*.
- **Backpressure** — if Redis is unreachable, `enqueueChat()` throws a clean
  **503** (`"The AI chat queue is unavailable..."`) instead of silently hanging.
- **Failure isolation** — a single crashing job emits `chat:error` to that user
  and is retried/removed without affecting the next job.

One user can send only one message at a time (the widget disables input while a
request is in flight), so a single user can't flood the queue.

### Socket.IO — live updates per user

`server.ts` calls `initSocket(httpServer)` which attaches **Socket.IO to the same
HTTP port** as the REST API (default 5000).

| Aspect | Detail |
|---|---|
| Handshake auth | Reuses the **same JWT** — checked in the `io.use()` middleware (`jwt.verify` + a `User` lookup). No token → connection rejected |
| Scoping | Each connection joins a private room `user:<id>`, so a user **only ever receives their own** events |
| Transport | The client uses WebSocket transport |

**Event reference** (all payloads include `requestId` so the widget ignores stale events):

| Event | Direction | Payload example |
|---|---|---|
| `chat:progress` | server → client | `{ requestId, stage: "searching" }` or `{ requestId, stage: "queued", position: 3 }` |
| `chat:token` | server → client | `{ requestId, token: "There" }` |
| `chat:done` | server → client | `{ requestId, answer: "There are 10 students.", sources: [...] }` |
| `chat:error` | server → client | `{ requestId, message: "Sorry, something went wrong..." }` |

Stage lifecycle: `rewriting → understanding → querying | searching → generating → done`.

### Streaming internals (`ollama.ts → chatStream`)

Ollama's `/api/chat` with `stream: true` returns a **NDJSON stream** — one JSON
object per line:

```json
{"model":"qwen2.5-coder","message":{"role":"assistant","content":"There"},"done":false}
{"model":"qwen2.5-coder","message":{"role":"assistant","content":" are"},"done":false}
...
{"model":"qwen2.5-coder","message":{"role":"assistant","content":""},"done":true,"total_duration":...}
```

`chatStream()`:

1. Opens the streaming request with `stream: true`.
2. Reads the response body chunk by chunk with `getReader()` / `TextDecoder`.
3. Splits on newlines, `JSON.parse`s each line, and for every `content` token:
   - appends it to an internal `full` accumulator,
   - calls `onToken(token)` → the worker forwards it as `chat:token`.
4. Returns the complete answer at the end (used for `chat:done`).

Note: intermediate pipeline calls (`rewriteForSearch`, `classify`, `extractQuery`)
are **not** streamed — they're short-lived helper calls. Only the final answer
generation exposes tokens to the user.

---

## 5. File-by-file map

### Backend — chat & RAG (`backend/src/modules/assistant/`)

| File | Responsibility |
|---|---|
| `assistant.routes.ts` | `POST /ask` (auth-protected), wires the controller |
| `assistant.controller.ts` | Sanitizes input, `enqueueChat()`, returns **202** with `{ jobId, requestId, position }` |
| `history.ts` | Shared history guards: `HISTORY_LIMIT = 16`, `MESSAGE_CHAR_LIMIT = 4000`, `sanitizeHistory()` |
| `progress.ts` | `ChatProgress` interface (`stage(name)`, `token(text)`) threaded through the pipeline |
| `queue.ts` | Redis `IORedis` connection, BullMQ `Queue("assistant-chat")`, `enqueueChat()` with position math + 503 fallback |
| `worker.ts` | `Worker` with `concurrency: 1`; runs the whole pipeline; wires `ChatProgress` to Socket.IO; emits `chat:done` / `chat:error` |
| `queryBuilder/catalog.ts` | The **allow-list**: 19 models with fields, types, allowed operators, aliases, groupable/aggregatable columns + `findTarget`/`findField` |
| `queryBuilder/router.ts` | `tryAnalytics()` orchestrator: classify → extract → execute → format; falls back to `null` (→ semantic) on any error |
| `queryBuilder/compiler.ts` | Validates an `AnalyticsQuery` against the catalog and builds/executes the Prisma call (`count` / `list` / `aggregate`), resolves FK labels |

### Backend — plumbing

| File | Responsibility |
|---|---|
| `helpers/ollama.ts` | Ollama HTTP client: `embed()`, `chat()`, `chatStream()` (NDJSON), `rewriteForSearch()`, `chatJson()`, `classify()` |
| `helpers/socket.ts` | `Socket.IO` server on the HTTP port, JWT middleware, `user:<id>` rooms, `emitToUser()` |
| `helpers/globals.ts` | `sendResponse()`, pagination helpers, `toIsoDate()`, `formatError()` |
| `helpers/catchAsync.ts` | Express async error wrapper |
| `helpers/ApiError.ts` | `ApiError(code, message)` for expected errors |
| `middlewares/auth.ts` | REST JWT guard; sets `req.user` |
| `server.ts` | Boots the app, `initSocket(server)`, `startChatWorker()`, graceful shutdown |
| `prisma/embed-seed.ts` | Ingests courses / assignments / library books into the `Embedding` table (`npm run rag-seed`) |

### Frontend

| File | Responsibility |
|---|---|
| `admin/src/components/AiChatWidget.vue` | The whole chat UX: socket connect, requestId, queue position, stage labels, thinking vs writing states, token streaming, history cap, error handling |
| `admin/src/plugins/socket.js` | Default instance (legacy `MessagesCom` compatibility) + lazy auth-aware `getSocket()` for the widget |

---

## 6. Data layer & the embedding store

The RAG knowledge base is the `Embedding` table (PostgreSQL + pgvector):

```prisma
model Embedding {
  id         Int      @id @default(autoincrement())
  sourceType String   // "course" | "assignment" | "libraryBook"
  sourceId   Int      // the id of the source row
  content    String   // the raw text chunk that was embedded
  embedding  Unsupported("vector(768)")   // 768-dim pgvector column
  createdAt  DateTime @default(now())

  @@index([sourceType, sourceId])
}
```

### Populating it

`prisma/embed-seed.ts` (run with `npm run rag-seed` in `backend/`) walks the
existing relational data and, for each row, creates one embedding row:

| Source | Text embedded |
|---|---|
| Course | `"{courseName} ({courseCode}): {description}"` |
| Assignment | `"{title}: {description}"` |
| Library book | `"{title} by {author}, category: {category}"` |

Each row calls `embed(text)` (Ollama `/api/embed`, `nomic-embed-text`) and inserts
`[0.123, -0.045, …]` into the `vector(768)` column.

> Run it **once after seeding/importing data**, and **again whenever that data
> changes** — retrieval is only as good as the last ingested embeddings.

### Retrieval

The worker runs a raw SQL query against this table using cosine distance:

```sql
SELECT content, "sourceType", "sourceId"
FROM "Embedding"
ORDER BY embedding <=> :vector
LIMIT 5;
```

Because the question is first rewritten to a standalone form, this search works
correctly mid-conversation, not just for first messages.

---

## 7. Frontend implementation (`AiChatWidget.vue`)

### Chat state

| State | Purpose |
|---|---|
| `isChatLoading` | any request is in flight (disables input & suggestions) |
| `streaming` | answer tokens are currently being appended |
| `writing` | **true once generation starts** — flips the UX from the *thinking* bubble to the *writing* bubble |
| `stageText` | human-readable stage label ("Waiting in queue (position 2)…", "Searching the knowledge base…") |
| `queuePosition` | from the `202` response |
| `requestId` | every socket event is matched against this; stale events are ignored (`isMine()`) |
| `messages` / `history` | visible bubbles + the compact turn list sent to the backend (last 16) |

### Round-trip

1. `sendMessage()` pushes the user bubble, sets `isChatLoading = true`, creates a
   `requestId`, and pushes an **empty streaming assistant bubble**.
2. `connectSocket()` lazily connects via `getSocket()` and registers
   `chat:progress` / `chat:token` / `chat:done` / `chat:error` handlers.
3. The `202` callback stores the real `jobId` / `position`.
4. `chat:progress` updates `stageText`; on `stage === "generating"` the `writing`
   flag turns **true** (thinking bubble disappears, answer bubble appears).
5. `chat:token` appends to the final bubble and auto-scrolls.
6. `chat:done` finalizes the bubble (`answer`, `sources`, "Based on N sources")
   and pushes the turns into `history` (capped at 16).
7. Errors (`chat:error` or HTTP failure) show a friendly bubble and still record the
   user's attempt in history so a follow-up keeps context.

### Thinking vs writing (one indicator at a time)

```
thinking phase (writing = false)          writing phase (writing = true)
  ┌───────────────┐                          ┌────────────────────────┐
  │ 🤖 ● ● ●      │   ── first token ──▶    │ 🤖 There are 10 stud█ │
  │ Searching…    │                          │ Based on 1 source      │
  └───────────────┘                          └────────────────────────┘
```

- `visibleMessages` (computed) hides the empty streaming bubble until `writing`,
  so only **one** bubble/indicator is ever on screen.
- `beforeUnmount()` disconnects the socket cleanly.

### Socket plugin (`admin/src/plugins/socket.js`)

- `getSocket()` — lazy, **auth-aware** singleton (`auth: { token }`), reconnects
  on demand; this is what the widget uses.
- Default export — an unauthenticated instance retained for backwards
  compatibility with `MessagesCom.vue`.

---

## 8. Configuration reference

### Backend — `backend/.env`

| Variable | Default / example | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/edu_rag` | Prisma/PostgreSQL + pgvector (host port must match your docker-compose) |
| `REDIS_URL` | `redis://localhost:6379` | BullMQ queue backing store (host port must match your docker-compose, e.g. `6389`) |
| `PORT` / `IP` | `5000` / `0.0.0.0` | REST + Socket.IO listening address |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | random / `7d` | REST & socket authentication |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text:latest` | embedding model (768-dim) |
| `OLLAMA_CHAT_MODEL` | `qwen2.5-coder:latest` | chat model used for every LLM call |
| `NODE_ENV` | `development` | error detail level |

> ⚠️ Keep the **host ports** in `docker-compose.yml` in sync with `DATABASE_URL`
> and `REDIS_URL`. The project tracks `.env.example`; your local `.env` may differ
> (e.g. Postgres on `5434`, Redis on `6389`) and that's fine — just be consistent.

### Frontend — `admin/.env`

| Variable | Example | Purpose |
|---|---|---|
| `VUE_APP_API_URL` | `http://localhost:5000/api/v1` | REST base URL (axios) |
| `VUE_APP_SOCKET` | `http://localhost:5000` | Socket.IO URL (same host/port as the API, **without** `/api/v1`) |
| `VUE_APP_BASE_FILE_PATH` | `http://localhost:5000/uploads` | uploaded file URLs |

### Docker services (`backend/docker-compose.yml`)

| Service | Image | Host port → container | Notes |
|---|---|---|---|
| `postgres` | `pgvector/pgvector:pg17` | `5433` (local env may use `5434`) | runs the init SQL automatically |
| `redis` | `redis:7-alpine` | `6389` → `6379` (your local setup) | required by BullMQ |
| `ollama` | (commented out) | — | Ollama usually runs natively on `localhost:11434` |

<!-- CHUNK-CONTINUE -->