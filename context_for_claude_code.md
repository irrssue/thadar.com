# Context for Claude Code

> Read this first on any new chat. It's the one-stop briefing for the Thadar
> project so I don't have to re-explain everything. If something here disagrees
> with the code, the code wins — but flag it so I can fix this doc.

---

## What this is

**Thadar** (Burmese for "generous / giving") is an all-in-one EdTech teaching
platform. It started as a private tool for a single student in Myanmar and is
being grown toward public use. Live at **https://thadar.com**.

Core product: a content/lesson library (video + text), assignments with
progress tracking, and teacher + student roles — responsive web only, no native
mobile app at MVP.

### Surfaces (multi-tenant by hostname)

| Host | Rewrites to | Who |
|------|-------------|-----|
| `thadar.com` | `/` (student + teacher app) | students & teachers |
| `admin.thadar.com` | `/admin` | platform admins (`SUPER_ADMIN` / `ADMIN`) |
| `parents.thadar.com` | `/parent` | parents (read-only) |

The host → route rewrite is driven by env vars `ADMIN_HOST` / `PARENT_HOST`
(see `proxy.ts`). Locally everything is reachable directly at `/admin`,
`/parent`, etc.

---

## Tech stack

- **Framework:** Next.js 16 — **App Router only**, Turbopack. (`app/` is at repo
  root; there is **no** `src/` directory and **no** Pages Router.)
- **Language:** TypeScript, strict mode. No `any` — use `unknown` and narrow.
- **Styling:** Tailwind CSS v4.
- **Auth:** Auth.js v5 (NextAuth beta) — Credentials provider, JWT sessions,
  bcrypt password hashing.
- **ORM:** Prisma 7 with the `@prisma/adapter-pg` driver adapter. Prisma is the
  ONLY way to talk to the DB — no raw SQL without a documented reason.
- **Database:** PostgreSQL 16, self-hosted in Docker.
- **Email:** Resend (implemented; logs a no-op until `RESEND_API_KEY` + a
  verified sending domain are set).
- **Planned, not built yet:** MinIO (S3-compatible storage for lesson
  video/file uploads via presigned URLs), Redis (cache/sessions), Sentry
  (monitoring). Video upload + quizzes are intentionally deferred until MinIO /
  the relevant migrations exist — don't assume they work.

### Architecture rules (non-negotiable)

1. Frontend NEVER connects to the DB directly — all data access goes through
   App Router route handlers under `app/api/**`.
2. All config in env vars. No hardcoded secrets, URLs, or credentials.
3. App server is stateless — no local file storage. Uploads go client → MinIO
   via presigned URLs (the app server never handles raw file bytes).
4. Docker everywhere.
5. App Router only; Prisma only.
6. API responses always use the envelope:
   `{ success: true, data } | { success: false, error }`.

There is **no global role field for app authorization.** `defaultView`
(`STUDENT` | `TEACHER`) is only a UI preference and is never used for authz.
Every protected action is authorized per-request against `ClassMembership` (see
`server/access.ts`): "teacher" = the owning teacher of *that* class, "student" =
an active member of *that* class. The same person can teach one class and be a
student in another. (Admin panel is the exception — it gates on the
`SUPER_ADMIN` / `ADMIN` role.)

---

## Project structure

```
app/              → App Router pages, layouts, API routes
  api/            → All route handlers (the only DB-access layer)
  admin/          → Admin control panel UI (admin.thadar.com)
  parent/         → Read-only parent portal (parents.thadar.com)
  _components/    → Reusable UI for routes (underscore = non-route)
components/       → Shared UI components (student / teacher / parent)
server/           → Server-only logic — NEVER imported by client components
  db.ts           → PrismaClient singleton (pg driver adapter)
  auth.ts         → Auth.js v5 config (Credentials, JWT, view-aware session)
  api.ts          → Response envelope + requireUser / readJson helpers
  access.ts       → Per-request authorization against ClassMembership
  classes.ts      → Class-scoped query helpers
  events.ts       → Domain events: notification + email + audit in one call
  email.ts        → Resend wrapper (no-op without a key)
  parent.ts       → Parent-portal derived data
  admin/          → Admin-only server logic
lib/              → Framework-agnostic utilities (e.g. inviteCode.ts)
types/            → Shared TypeScript types
prisma/
  schema.prisma   → DB schema (single source of truth)
  migrations/     → Migration history
  seed.ts         → Idempotent demo dataset
docker/homeserver/docker-compose.yml → prod container definition
docs/             → Project docs (bug reports, etc.)
proxy.ts          → Route protection + host rewrites (Next 16 renamed Middleware)
auth.config.ts    → Edge-safe Auth.js config used by proxy.ts
prisma.config.ts  → Prisma 7 config (datasource URL + seed command)
```

---

## Hosting / infrastructure — IMPORTANT

The site is **self-hosted on my own home server** (a Docker host I call
`homelab`). It is NOT on Vercel or any cloud PaaS.

- **You can SSH into prod to inspect or fix things directly:**
  `ssh irrssue@homelab` (also reachable as `ssh ssh.irrssue.com` via Cloudflare
  Tunnel, which is what CI uses). You may run migrations, read container logs,
  and fix prod directly.
- The app runs as a Docker container `thadar_app` using **host networking**,
  defined in `docker/homeserver/docker-compose.yml`. Cloudflare Tunnel proxies
  the public domain to the container.
- Repo on the box lives at `~/thadar.com`. The prod `.env` lives at
  `~/thadar.com/.env` (chmod 600) and is never committed.
- **Postgres** runs in its own Docker container, bound to `127.0.0.1:5433` on
  homelab (plus a Tailscale address). From my Mac, dev hits homelab Postgres
  over Tailscale at `homelab:5433`.
- Backups to Cloudflare R2 are planned, not done.

### Deploy pipeline (`.github/workflows/build-push.yml`)

Push to `main` → GitHub Actions:

1. Build + push the Docker image to GHCR (`ghcr.io/irrssue/thadar`).
2. SSH to homelab over Cloudflare Tunnel.
3. `git pull` on the box.
4. **`prisma migrate deploy` runs BEFORE the new container starts** — schema is
   always ahead of or level with the code. If migrate fails, the deploy aborts
   and the running container keeps serving (a failed migration can never take
   the site down). Do not move migrations into the container entrypoint — that
   caused a crash-loop outage once.
5. `docker compose ... up -d` the new image; prune old images.

`paths-ignore` skips the build for `**.md` changes — pure-docs commits don't
trigger a deploy.

### Prod data — be careful

- Prod has **3 real users and no demo seed**. There is no `admin@thadar.com` on
  prod. My admin access is `irrssue@gmail.com` (role `SUPER_ADMIN`).
- **Never run `prisma db seed` against prod.** Seed is for local dev only.

---

## Local development

```bash
npm install
cp .env.example .env          # fill DATABASE_URL + AUTH_SECRET
npx prisma generate
npx prisma migrate deploy     # or migrate dev when changing the schema
npx prisma db seed            # optional: demo teacher/student/class/lessons
npm run dev                   # → http://localhost:3000
```

- Local dev points `DATABASE_URL` at homelab Postgres over Tailscale
  (`homelab:5433`), or a local Postgres at `127.0.0.1:5433`.
- Health check: `curl localhost:3000/api/health` → `200` when DB is reachable.
- **Demo logins** (after seeding, password `password123`):
  - `teacher@thadar.com` — owns "English Foundations" (invite code `MYANMAR`)
  - `student@thadar.com` — enrolled in that class
  - `parent@thadar.com` — parent portal
- **Gotcha:** a manually-started dev server can serve stale code (missing
  routes / session fields) until restarted. If something that should exist 404s
  or a session field is missing, restart the dev server first.

---

## Environment variables

Active (see `.env.example` for the full annotated list):

```
DATABASE_URL        # postgresql://thadar:PASSWORD@host:5433/thadar?schema=public
AUTH_SECRET         # openssl rand -base64 32
AUTH_URL            # http://localhost:3000 dev · https://thadar.com prod
AUTH_TRUST_HOST     # true (Cloudflare Tunnel proxies the request)
ADMIN_HOST          # host rewritten to /admin (admin.thadar.com)
PARENT_HOST         # host rewritten to /parent (parents.thadar.com)
RESEND_API_KEY      # transactional email; logged no-op when unset
EMAIL_FROM_NOREPLY  # "Thadar <noreply@thadar.com>" — system mail
EMAIL_FROM_HELLO    # "Thadar <hello@thadar.com>" — human-reply mail
```

Planned (later phases): `MINIO_*`, `REDIS_URL`, `SENTRY_DSN`.

Never hardcode any of these. Never commit `.env` (only `.env.example`).

---

## Working agreements (how I want you to work)

- **Read `node_modules/next/dist/docs/` before writing Next.js code.** This is
  Next 16 — APIs, conventions, and file structure differ from older versions.
  Heed deprecation notices. (See `AGENTS.md`.)
- **Commit + push after every meaningful change — no batching.** Format:
  `type(scope): short description` where type ∈
  feat/fix/refactor/chore/docs/style/test and scope is the area (auth, courses,
  upload, schema, ui, config, …). Push to `main` immediately: change → commit →
  push.
- Never modify `schema.prisma` without creating the migration
  (`prisma migrate dev`) and committing it.
- Never install a new major dependency without explaining why.
- Don't use `localStorage` / `sessionStorage` for auth — Auth.js owns sessions.
- Components are functional only. Async uses async/await, never `.then()` chains.
- Heads-up: parallel Claude sessions can silently revert a committed fix via a
  refactor from a stale base — re-check `HEAD` after any fetch/pull before
  declaring something done.

---

## Pointers

- `README.md` — public-facing setup + full API surface reference.
- `CLAUDE.md` / `AGENTS.md` — project instructions (loaded automatically).
- `docs/bugs.md` — recorded bug-fix passes.
