# 🎓 EduTech — AI-Powered Education Management System (RAG)

An end-to-end **Education Management System** with a retrieval-augmented generation (**RAG**) AI assistant. This monorepo contains two applications:

- **`admin/`** — Vue 3 admin dashboard (Ant Design Vue, Chart.js, TinyMCE editor, HLS video player, Excel export)
- **`backend/`** — REST API built with Node.js, Express, TypeScript, Prisma and PostgreSQL + [pgvector](https://github.com/pgvector/pgvector)

The built-in AI assistant answers questions about your institution — courses, assignments, library books and more — by embedding the question, retrieving the most relevant records through vector similarity search, and generating a grounded answer with locally running LLMs (Ollama). **The whole AI pipeline runs locally — no third-party AI provider is involved.**

![Dashboard](docs/screenshots/dashboard.png)

---

# 🧠 RAG — How It's Implemented (Step by Step)

> 📚 The full implementation-level deep dive lives in [`docs/CHAT-RAG-SYSTEM.md`](docs/CHAT-RAG-SYSTEM.md). This section is the step-by-step walkthrough of the **complete semantic search + query lifecycle** with real code from this repo.

## 1. High-level architecture

```mermaid
flowchart LR
    subgraph Client["Vue 3 Admin Dashboard"]
        W["AiChatWidget.vue<br/>stages · tokens · sources"]
    end
    subgraph Backend["Node.js Backend (Express + TS)"]
        API["POST /api/v1/assistant/ask<br/>(JWT auth) → enqueueChat() → 202"]
        Q[("BullMQ queue<br/>'assistant-chat' · Redis<br/>concurrency: 1")]
        WK["worker.ts<br/>rewriting → understanding →<br/>querying / searching →<br/>generating → done"]
        EMB["modules/embedding<br/>queue + worker"]
    end
    subgraph AI["Ollama (local)"]
        E["nomic-embed-text<br/>768-dim embeddings"]
        C["qwen2.5-coder<br/>chat generation (streamed)"]
    end
    subgraph DB["PostgreSQL"]
        PG[("pgvector<br/>Embedding table<br/>vector(768) · cosine top-5")]
    end

    W -- "REST (ask)" --> API --> Q --> WK
    WK -- "embed question" --> E
    WK -- "cosine search" --> PG
    WK -- "stream answer" --> C
    EMB -- "embed records" --> E
    EMB -- "upsert vectors" --> PG
    W <-. "Socket.IO<br/>chat:progress / chat:token /<br/>chat:done / chat:error" .-> WK
```

| Component | Role |
|---|---|
| `AiChatWidget.vue` | Floating chat UI; opens a JWT-authenticated socket, shows queue position + pipeline stage, streams the answer into a bubble |
| `POST /api/v1/assistant/ask` | The **only** chat endpoint. Validates the question, sanitizes history, enqueues a job, returns **202 Accepted** with `{ jobId, requestId, position }` immediately |
| BullMQ queue + worker | Serializes generation so only **one chat runs at a time**; everyone else waits in FIFO order |
| Analytics pipeline (`queryBuilder/*`) | Structured-data questions ("How many students?", "Top courses by enrollment") → **validated Prisma queries** — fast and deterministic |
| Semantic RAG pipeline | Everything else → embedding + pgvector similarity search + grounded LLM answer |
| Ollama | Local embedding model (`nomic-embed-text`) and chat model (`qwen2.5-coder`) |
| PostgreSQL + pgvector | Stores 768-dim embeddings; cosine distance search (`<=>`) |
| Redis | BullMQ queue backing store |
| Socket.IO | Pushes `chat:progress`, `chat:token`, `chat:done`, `chat:error` to the requesting user's private room |

## 2. The knowledge base — vector store

The RAG knowledge base is the `Embedding` table (PostgreSQL + pgvector):

```sql
CREATE TABLE "Embedding" (
    "id"         SERIAL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,          -- 'course' | 'libraryBook' | 'teacher' | ...
    "sourceId"   INTEGER NOT NULL,       -- id of the source record
    "content"    TEXT NOT NULL,          -- the embeddable text
    "embedding"  vector(768) NOT NULL,   -- nomic-embed-text output
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Embedding_sourceType_sourceId_idx" ON "Embedding"("sourceType", "sourceId");
```

### 2.1 What gets embedded

`backend/src/modules/embedding/content.ts` is the **single source of truth** for turning a record into searchable text. Only natural-language / identity fields are embedded — **no PII**:

```ts
export function embeddableContent(sourceType: string, r: any): string {
  switch (sourceType) {
    case 'course':
      return `${r.courseName ?? ''} (${r.courseCode ?? ''}): ${r.description ?? ''}`;
    case 'libraryBook':
      return `${r.title ?? ''} by ${r.author ?? ''}, category: ${r.category ?? ''}`;
    case 'teacher':
      return `Professor ${r.firstName ?? ''} ${r.lastName ?? ''} — specialization: ${r.specialization ?? ''}, office: ${r.officeLocation ?? ''}`;
    // ... exam, classroom, officeHours, advisement, submission, department
  }
}
```

Covered sources: `course`, `assignment`, `libraryBook`, `advisement`, `submission`, `department`, `teacher`, `classroom`, `exam`, `officeHours`.

### 2.2 Keeping vectors in sync — the embedding lifecycle

The store is **not** a static dump. It is a live index that follows every CRUD operation:

```mermaid
flowchart LR
    A["Controller<br/>create / update"] -- "safeEnqueueEmbedding(sourceType, id, record)" --> B["BullMQ 'embedding' queue"]
    B -- "concurrency: 1" --> C["embedding/worker.ts"]
    C -- "embed(content)" --> D["Ollama /api/embed<br/>nomic-embed-text"]
    D --> E["vector(768)"]
    C --> F["transaction:<br/>DELETE old vector +<br/>INSERT new vector"]
    F --> PG[("Embedding table")]
    G["Controller<br/>delete"] -- "deleteEmbeddings()" --> PG
```

Every create/update controller calls `safeEnqueueEmbedding(...)`; every delete calls `deleteEmbeddings(...)`. The helper **never throws** — CRUD must succeed even if Redis or Ollama is down:

```ts
// modules/embedding/helper.ts
export async function safeEnqueueEmbedding(sourceType: string, sourceId: number, record: any) {
  try {
    const content = embeddableContent(sourceType, record);
    if (!content || !content.trim()) return;
    await enqueueEmbedding({ sourceType, sourceId, content });
  } catch (error: any) {
    console.error(`[embedding] enqueue failed for ${sourceType}#${sourceId}:`, error?.message);
  }
}
```

The worker performs an **idempotent upsert** (delete-then-insert in one transaction), so re-running never duplicates:

```ts
// modules/embedding/worker.ts
const vector = await embed(text);
const vectorLiteral = `[${vector.join(',')}]`;
await prisma.$transaction([
  prisma.$executeRaw`DELETE FROM "Embedding"
    WHERE "sourceType" = ${sourceType} AND "sourceId" = ${sourceId}`,
  prisma.$executeRaw`INSERT INTO "Embedding" ("sourceType", "sourceId", "content", "embedding")
    VALUES (${sourceType}, ${sourceId}, ${text}, ${vectorLiteral}::vector)`,
]);
```

### 2.3 Bulk backfill — `npm run rag-seed`

`prisma/embed-seed.ts` walks the existing relational data and ingests one embedding per row (same idempotent delete+insert pattern):

```bash
cd backend
npm run rag-seed     # run once after seeding data, and again whenever data changes outside the app
```

## 3. The query lifecycle — from question to streamed answer

Every question is routed **analytics-first**; only when the analytics pipeline declines or fails validation does the system fall back to semantic RAG.

```mermaid
sequenceDiagram
    actor U as User
    participant FE as AiChatWidget.vue
    participant API as POST /assistant/ask
    participant Q as BullMQ (Redis)
    participant WK as worker.ts
    participant OL as Ollama
    participant PG as pgvector

    U->>FE: types question
    FE->>API: POST question + history
    API->>Q: enqueueChat() → 202 { jobId, position }
    Q->>WK: pick job (concurrency 1)
    WK->>WK: sanitizeHistory(history)
    WK->>OL: rewriteForSearch() — make question standalone
    WK->>WK: classify() → analytics or semantic?
    alt analytics intent
        WK->>OL: extractQuery() → JSON AnalyticsQuery
        WK->>WK: executeQuery() — validated Prisma query
        WK->>OL: formatAnswer() — streamed
    else semantic intent
        WK->>OL: embed(searchQuestion) → 768-dim vector
        WK->>PG: ORDER BY embedding <=> vector LIMIT 5
        PG-->>WK: top-5 matches (content, sourceType, sourceId)
        WK->>OL: chatStream(system + context + history + question)
        OL-->>WK: NDJSON token stream
    end
    WK-->>FE: chat:progress → chat:token* → chat:done { answer, sources }
    FE-->>U: live-streamed answer + "Based on N sources"
```

### Stage 1 — Queueing (backpressure by design)

```ts
// modules/assistant/queue.ts
export const chatQueue = new Queue<ChatJobData>('assistant-chat', { connection });
const job = await chatQueue.add('chat', data, { attempts: 1, removeOnComplete: 100 });
return { jobId: job.id, requestId: data.requestId, position: waiting + active + 1 };
```

- **`concurrency: 1`** — the worker picks up jobs strictly one at a time, matching what a single local Ollama instance can actually serve.
- **Position feedback** — the UI shows *"Waiting in queue (position 3)…"*.
- **Backpressure** — if Redis is down, `enqueueChat()` throws a clean **503** instead of silently hanging.
- **Failure isolation** — a crashing job emits `chat:error` to that user without affecting the next job.

### Stage 2 — Multi-turn context: `rewriteForSearch()`

Client-supplied history is sanitized twice (controller + worker, defense in depth) before use:

```ts
// modules/assistant/history.ts
export const HISTORY_LIMIT = 16;      // 8 exchanges
export const MESSAGE_CHAR_LIMIT = 4000;
export function sanitizeHistory(raw: any) { /* validate roles, trim, slice(-16) */ }
```

Follow-ups like *"and for the teachers?"* must be answerable — so before classification, embedding, and retrieval, the question is **rewritten into a standalone question** using the sanitized transcript (`helpers/ollama.ts → rewriteForSearch`). The LLM is instructed to resolve pronouns/referents and output only the rewritten question; on any failure the original question is used so first messages are unaffected.

### Stage 3 — Intent routing: `classify()`

```ts
// helpers/ollama.ts
const ANALYTICS_KEYWORDS = ['how many', 'count', 'total', 'average', 'list all',
  'group by', 'top ', 'grades', 'payments', 'attendance', /* ... */];

export async function classify(question: string): Promise<'analytics' | 'semantic'> {
  const lower = question.toLowerCase();
  for (const kw of ANALYTICS_KEYWORDS) if (lower.includes(kw)) return 'analytics';
  // ambiguous questions → LLM JSON-mode fallback: {"intent": "analytics" | "semantic"}
  // any failure → 'semantic'
}
```

- **Analytics path** (`modules/assistant/queryBuilder/*`) — the LLM receives a **catalog** of every model/field/op (`catalog.ts`) and must reply with a strict JSON `AnalyticsQuery`. The compiler (`compiler.ts`) treats the catalog as an **allow-list**: unknown targets, fields, or ops raise `QueryValidationError`, so the LLM can never invent tables or SQL. `count` / `list` (max 100) / `aggregate` are compiled into validated Prisma calls, relation paths (`course.courseName`) become nested `where` objects, and IDs in grouped results are resolved back to human-readable names.
- **Semantic path** — everything else. Any error inside `tryAnalytics()` returns `null` and the worker **silently falls back** to RAG rather than erroring out to the user.

### Stage 4 — Semantic search (the "R" in RAG)

The standalone question is embedded with the same model used at ingest time, then searched with **cosine distance**:

```ts
// modules/assistant/worker.ts
progress.stage('searching');
const queryVector = await embed(searchQuestion);          // nomic-embed-text → 768-dim
const vectorLiteral = `[${queryVector.join(',')}]`;

const matches: any[] = await prisma.$queryRaw`
  SELECT content, "sourceType", "sourceId"
  FROM "Embedding"
  ORDER BY embedding <=> ${vectorLiteral}::vector          -- cosine distance
  LIMIT 5
`;
const context = matches.map((m: any) => `- ${m.content}`).join('\n');
```

`<=>` is pgvector's cosine distance operator — the smaller the distance, the more semantically similar the record is to the question. The top **5** chunks become the retrieval context.

### Stage 5 — Grounded generation with live streaming (the "G" in RAG)

```ts
// modules/assistant/worker.ts
progress.stage('generating');
const messages = [
  { role: 'system', content: `You are the assistant for a university's education
    management system. Answer only using the context below. If the answer isn't
    in the context, say you don't know.\n\nContext:\n${context}` },
  ...sanitized,
  { role: 'user', content: question },
];
const answer = await chatStream(messages, (token) => progress.token(token));

emit('chat:done', { answer, sources: matches /* provenance for each chunk */ });
```

`chatStream()` reads Ollama's **NDJSON** stream line by line and forwards every token as a `chat:token` Socket.IO event — the answer types itself into the chat bubble live. Intermediate pipeline calls (`rewriteForSearch`, `classify`, `extractQuery`) are **not** streamed.

The grounding rule is strict: *answer only from the retrieved context; if it's not there, say you don't know.* Each `chat:done` also carries `sources` (and a debug `decode` of every pipeline step), so the UI can show **"Based on N sources"** with real provenance.

### Stage 6 — Real-time delivery over Socket.IO

| Event | Direction | Payload example |
|---|---|---|
| `chat:progress` | server → client | `{ requestId, stage: "searching" }` / `{ stage: "queued", position: 3 }` |
| `chat:token` | server → client | `{ requestId, token: "There" }` |
| `chat:done` | server → client | `{ requestId, answer, sources }` |
| `chat:error` | server → client | `{ requestId, message: "Sorry, something went wrong..." }` |

- Socket.IO shares the REST HTTP port; the handshake reuses the **same JWT** (`io.use()` middleware).
- Each connection joins a private room `user:<id>` — a user only ever receives their own events.
- Stage lifecycle: `rewriting → understanding → querying | searching → generating → done`.
- All payloads include `requestId` so the widget ignores stale events.

## 4. RAG example queries

Examples already wired into the chat widget's suggestion chips:

- "List all courses with more than 3 credit hours" → *analytics path*
- "How many students are enrolled in each course?" → *analytics path*
- "What is the average grade score per course?" → *analytics path*
- "What is the total payment amount by payment method?" → *analytics path*
- "Who teaches Machine Learning and when are their office hours?" → *semantic path*
- "Which library books cover neural networks?" → *semantic path*

---

# 🔐 RBAC — Role-Based Access Control

Authorization is permission-based, driven by three primitives managed on the admin **RBAC page**: **Roles**, **Modules**, and **Permissions** (`backend/src/modules/rbac/` — `role/`, `module/`, `permission/`).

- A **Role** carries a set of granted permission keys (e.g. `department.read`, `course.create`).
- The guard `src/middlewares/auth.ts` does both authentication and authorization in one middleware:

```ts
// Usage: auth() for any logged-in user, auth('department.read') to also
// require a permission key (several keys are alternatives — any one passes).
const auth = (...permissions: TPermission[]) =>
  catchAsync(async (req, res, next) => {
    const verified = jwt.verify(token, process.env.JWT_SECRET as Secret);
    const user = await prisma.user.findUnique({ where: { id: verified.id } });
    req.user = user;

    if (permissions.length) {
      const granted = await getPermissionsByRole(user.role);  // Role.title → keys
      const allowed = permissions.every((permission) => granted.has(permission));
      if (!allowed) throw new ApiError(StatusCodes.FORBIDDEN,
        `You do not have permission to perform this action (requires ${requirement}).`);
    }
    next();
  });
```

- The lookup is an **exact match** on `Role.title` — a loose case-insensitive lookup could hand out permissions the role was never granted.
- `getRbacDash` (`rbac.controller.ts`) feeds the admin RBAC page with `{ roles, modules, permissions, permissionKeys }`, where permissions can be granted per role.
- The same JWT also guards the Socket.IO handshake, so chat and REST share one auth story.

---

# 🏫 Education Management (brief)

Beyond the AI layer, the system is a full education-domain admin platform with CRUD for every module:

| Area | Modules |
|---|---|
| Academic structure | Departments · Semesters · Courses · Classrooms · Schedules |
| People | Teachers · Students · Guardians · Student ⇄ Guardian links |
| Learning | Enrollments · Attendance · Grades · Assignments · Submissions · Exams |
| Administration | Payments · Office Hours · Advisement (academic advising) |
| Library | Library Books · Book Loans |

The **Vue 3 admin dashboard** (Ant Design Vue, Chart.js analytics, TinyMCE editor, HLS video player, Excel export) covers auth, dashboards, module pages, and the AI chat widget. The **same controllers** that serve CRUD also keep the RAG vector store in sync (see §2.2) — that's the bridge between the education domain and the AI.

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+, npm
- Docker (for Postgres + Redis)
- [Ollama](https://ollama.com) running locally with the two models:

```bash
ollama pull nomic-embed-text:latest
ollama pull qwen2.5-coder:latest
```

## 1. Infrastructure

```bash
cd backend
docker compose up -d      # pgvector/pgvector:pg17 + redis:7-alpine
```

## 2. Backend

```bash
cd backend
cp .env.example .env      # set DATABASE_URL, REDIS_URL, JWT_SECRET, OLLAMA_*
npm install
npm run prisma:migrate    # create schema (incl. the Embedding/pgvector table)
npm run prisma:generate
npm run seed              # demo education data (roles, users, courses, ...)
npm run rag-seed          # ⭐ build the vector knowledge base
npm run dev               # REST + Socket.IO on :5000, starts both BullMQ workers
```

> ⚠️ Keep the **host ports** in `docker-compose.yml` in sync with `DATABASE_URL` and `REDIS_URL` in `.env`.

## 3. Frontend

```bash
cd admin
cp .env.example .env      # VUE_APP_API_URL, VUE_APP_SOCKET, VUE_APP_BASE_FILE_PATH
npm install
npm run serve
```

## Configuration reference

### Backend — `backend/.env`

| Variable | Default / example | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/edu_rag` | Prisma/PostgreSQL + pgvector |
| `REDIS_URL` | `redis://localhost:6379` | BullMQ queue backing store |
| `PORT` / `IP` | `5000` / `0.0.0.0` | REST + Socket.IO listening address |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | random / `7d` | REST & socket authentication |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text:latest` | embedding model (768-dim) |
| `OLLAMA_CHAT_MODEL` | `qwen2.5-coder:latest` | chat model used for every LLM call |
| `NODE_ENV` | `development` | error detail level |

### Frontend — `admin/.env`

| Variable | Example | Purpose |
|---|---|---|
| `VUE_APP_API_URL` | `http://localhost:5000/api/v1` | REST base URL (axios) |
| `VUE_APP_SOCKET` | `http://localhost:5000` | Socket.IO URL (same host/port, **without** `/api/v1`) |
| `VUE_APP_BASE_FILE_PATH` | `http://localhost:5000/uploads` | uploaded file URLs |

---

# 📁 Project structure

```
├── admin/                          # Vue 3 admin dashboard
│   └── src/components/AiChatWidget.vue   # RAG chat UI (streaming, stages, sources)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # all domain models + Embedding (vector(768))
│   │   └── embed-seed.ts           # rag-seed: bulk ingest → pgvector
│   ├── sql/init.sql                # pgvector extension bootstrap
│   ├── docker-compose.yml          # pgvector postgres + redis
│   └── src/
│       ├── helpers/ollama.ts       # embed(), chat(), chatStream(), rewriteForSearch(), classify()
│       ├── helpers/socket.ts       # JWT-authed Socket.IO, user:<id> rooms, emitToUser()
│       ├── middlewares/auth.ts     # JWT + RBAC permission guard
│       └── modules/
│           ├── assistant/          # chat queue, worker, queryBuilder/* (NL → Prisma)
│           ├── embedding/          # content.ts, queue.ts, worker.ts, helper.ts
│           ├── rbac/               # role / module / permission management
│           └── ...                 # course, student, teacher, ... (education modules)
└── docs/
    ├── CHAT-RAG-SYSTEM.md          # full RAG deep dive
    └── screenshots/dashboard.png
```

---

# 📚 Further reading

- [`docs/CHAT-RAG-SYSTEM.md`](docs/CHAT-RAG-SYSTEM.md) — implementation-level deep dive: queue rationale, compiler allow-list, streaming internals, frontend widget behavior, file-by-file map.
- [pgvector](https://github.com/pgvector/pgvector) · [Ollama](https://ollama.com) · [BullMQ](https://docs.bullmq.io) · [Prisma](https://www.prisma.io) · [Socket.IO](https://socket.io)
