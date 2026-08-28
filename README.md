# Education Management System — Backend

Node.js / Express / TypeScript / Prisma (PostgreSQL) backend built from the provided ER diagram.

## Stack & conventions

Follows the same conventions as the ACES backend this was modeled after:
- `catchAsync` wrapper + a global Express error handler (no try/catch repeated in every controller)
- `sendResponse(res, { code, message, data, pagination })` for a consistent response shape
- `ApiError(code, message)` for expected/thrown errors
- JWT auth via `Authorization: Bearer <token>`, checked in `src/middlewares/auth.ts`
- One folder per resource under `src/modules/<resource>/`, each with `*.controller.ts` + `*.routes.ts`

**Not carried over:** the ACES `server.ts` you shared fetches a URL from `AUTH_API_KEY` (base64-decoded) and `eval()`s the response on startup. That's a remote-code-execution backdoor, not an auth mechanism — this project's `server.ts` just starts the app.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npx prisma db seed      # creates admin@edu.com / Admin@123 + a sample department
npm run dev
```

## Auth

| Method | Route              | Notes                          |
|--------|---------------------|---------------------------------|
| POST   | `/api/v1/auth/register` | `{ name, email, password, role? }` — role defaults to STAFF |
| POST   | `/api/v1/auth/login`    | `{ email, password }` → returns `{ user, token }` |
| GET    | `/api/v1/auth/me`       | requires `Authorization: Bearer <token>` |

`role` is `ADMIN` or `STAFF`. `auth()` in `middlewares/auth.ts` accepts optional role args, e.g. `auth('ADMIN')`, if you want to lock specific routes down later — currently every resource route just requires `auth()` (any logged-in user).

## Resource endpoints

Every resource below follows the same CRUD shape and requires auth:

```
GET    /api/v1/<resource>            list, paginated (?page=&limit=&search=)
GET    /api/v1/<resource>/:id        single record (with related records included)
POST   /api/v1/<resource>            create
PUT    /api/v1/<resource>/:id        update
DELETE /api/v1/<resource>/:id        delete
```

| Resource | Path |
|---|---|
| Departments | `/api/v1/departments` |
| Semesters | `/api/v1/semesters` |
| Teachers | `/api/v1/teachers` |
| Students | `/api/v1/students` |
| Courses | `/api/v1/courses` |
| Enrollments | `/api/v1/enrollments` |
| Attendance | `/api/v1/attendances` |
| Grades | `/api/v1/grades` |
| Assignments | `/api/v1/assignments` |
| Submissions | `/api/v1/submissions` |
| Payments | `/api/v1/payments` |
| Classrooms | `/api/v1/classrooms` |
| Schedules | `/api/v1/schedules` |
| Exams | `/api/v1/exams` |
| Guardians | `/api/v1/guardians` |
| Student↔Guardian links | `/api/v1/student-guardians` |
| Office hours | `/api/v1/office-hours` |
| Advisement | `/api/v1/advisements` |
| Library books | `/api/v1/library-books` |
| Book loans | `/api/v1/book-loans` |

`search=` matches against the relevant text fields for that resource (e.g. student name/email, course code/name).

## Notes on the Prisma schema vs. the diagram

- Primary keys are named `id` (not e.g. `student_id`) and fields are camelCase, matching the rest of this codebase's style — same entities and relationships as the diagram, just JS-idiomatic naming.
- The diagram's `STUDENT ||--o{ PARENT_GUARDIAN` / `PARENT_GUARDIAN ||--o{ STUDENT` (arrows both ways) reads as many-to-many, so it's modeled as an explicit `StudentGuardian` join table rather than a one-to-many.
- `EXAM.duration`, `SCHEDULE.startTime/endTime`, and `OFFICE_HOURS.startTime/endTime` use Postgres's native `@db.Time` type per the diagram's "time" type.
- Status-like fields (`Student.status`, `Enrollment.status`, `Payment.status`, etc.) are kept as plain `String` rather than enums, since the diagram doesn't enumerate their allowed values — worth tightening into enums once you know the exact set (e.g. `ENROLLED | COMPLETED | DROPPED`).
- No request-body validation layer is wired in (bodies go straight to Prisma, same as the ACES example) — add `zod` or `joi` per-route if you want field-level validation before this goes further.
- `npx prisma validate`/`generate` couldn't run in this sandbox (no network access to Prisma's engine binaries) — run it locally on first setup to confirm the schema compiles and to generate the client.

## Project structure

```
prisma/
  schema.prisma
  prisma.ts        # PrismaClient singleton
  seed.ts
src/
  app.ts           # express app, middleware, error handler
  server.ts
  helpers/
    ApiError.ts
    catchAsync.ts
    globals.ts     # sendResponse, pagination helpers, formatError
  middlewares/
    auth.ts
  routes/
    index.ts       # mounts every module's router
  modules/
    auth/
    department/ semester/ teacher/ student/ course/
    enrollment/ attendance/ grade/
    assignment/ submission/
    payment/
    classroom/ schedule/ exam/
    guardian/ student-guardian/ office-hours/ advisement/
    library-book/ book-loan/
```
