# Thadar

All-in-one EdTech teaching platform. Live at [thadar.com](https://thadar.com).

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Auth:** Auth.js v5 (NextAuth) — Credentials provider, JWT sessions, bcrypt
- **ORM:** Prisma 7 with `@prisma/adapter-pg` driver adapter
- **Database:** PostgreSQL 16 (self-hosted, Docker)
- **Email:** Resend (implemented; logged no-op until `RESEND_API_KEY` + a verified domain are set)
- **Storage:** MinIO (planned, S3-compatible — for lesson video/file uploads)
- **Cache/Sessions:** Redis (planned)
- **Monitoring:** Sentry (planned)

## Infrastructure

Self-hosted on home server cluster.

- App, DB, storage each in Docker containers
- Postgres bound to `127.0.0.1:5433` + Tailscale `100.100.200.29:5433` on homelab
- Public access via **Cloudflare Tunnel** → thadar.com → `localhost:3001` (PM2-managed)
- Deploys via GitHub Actions over Cloudflare-tunneled SSH
- Backups to Cloudflare R2 (planned)

## Development

```bash
npm install
cp .env.example .env
# fill DATABASE_URL, AUTH_SECRET (openssl rand -base64 32)
npx prisma generate
npx prisma migrate deploy   # or `migrate dev` when iterating on the schema
npx prisma db seed          # optional: demo teacher/student/class/lessons
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local dev hits homelab Postgres over Tailscale — `DATABASE_URL` points at `homelab:5433`.
A local Postgres works too: point `DATABASE_URL` at `127.0.0.1:5433` and run
the migrate + seed steps above.

After seeding, sign in as either demo account (password `password123`):

- **teacher@thadar.com** — owns the "English Foundations" class (invite code `MYANMAR`)
- **student@thadar.com** — enrolled in that class

Readiness check: `curl localhost:3000/api/health` → `200` when the DB is reachable.

## Environment Variables

```
DATABASE_URL          # postgresql://thadar:PASSWORD@host:5433/thadar?schema=public
AUTH_SECRET           # openssl rand -base64 32
AUTH_URL              # http://localhost:3000 in dev, https://thadar.com in prod
AUTH_TRUST_HOST       # true (Cloudflare Tunnel proxies the request)
ADMIN_HOST            # hostname rewritten to /admin tree (e.g. admin.thadar.com)
RESEND_API_KEY        # transactional email; no-op logged when unset
EMAIL_FROM_NOREPLY    # "Thadar <noreply@thadar.com>" — system mail
EMAIL_FROM_HELLO      # "Thadar <hello@thadar.com>" — human-reply mail
```

Planned (later phases):

```
MINIO_ENDPOINT
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
MINIO_BUCKET_NAME
REDIS_URL
SENTRY_DSN
```

## Project Structure

```
app/              → Next.js App Router pages, layouts, API routes
  api/            → All route handlers (see API section below)
  admin/          → Admin control panel UI (admin.thadar.com)
  login/          → Login + register UI
  reset-password/ → Password reset UI
  grades/         → Student grades view
  _components/    → Reusable UI components (underscore = non-route)
server/           → Server-only logic (never imported by client components)
  db.ts           → PrismaClient singleton with pg driver adapter
  auth.ts         → Auth.js v5 config (Credentials, JWT, view-aware session)
  api.ts          → Shared response envelope + requireUser/readJson helpers
  access.ts       → Per-request authorization against ClassMembership
  classes.ts      → Class-scoped query helpers
  events.ts       → Domain events: notification + email + audit in one call
  email.ts        → Resend wrapper (From/Reply-To rules; no-op without a key)
  admin/          → Admin-only server logic (overview, users, queue, etc.)
lib/              → Framework-agnostic utilities (e.g. inviteCode.ts)
prisma/
  schema.prisma   → DB schema (single source of truth)
  migrations/     → Migration history
  seed.ts         → Idempotent demo dataset (`prisma db seed`)
proxy.ts          → Route protection (Next 16 renamed Middleware)
auth.config.ts    → Edge-safe Auth.js config used by proxy.ts
prisma.config.ts  → Prisma 7 config (datasource URL + seed command)
```

## Database

Postgres runs in `~/docker/thadar-postgres/` on homelab:

```bash
ssh irrssue@homelab
cd ~/docker/thadar-postgres
docker compose ps
```

Apply schema changes:

```bash
# locally
npx prisma migrate dev --name <change>
git push origin main   # deploy.yml runs migrate deploy on homelab
```

## Auth

- `POST /api/auth/register` → `{ name, email, password }`, returns `{ success, data: { id, email, name, defaultView } }`
- `POST /api/auth/callback/credentials` (Auth.js standard) → sets JWT cookie
- `GET  /api/auth/session` → current session w/ `user.id` and `user.defaultView`
- `proxy.ts` protects `/home`, `/classes`, `/profile`, `/inbox`, `/teacher`, `/signup/intent` — unauthed requests redirect to `/login?callbackUrl=...`

There is **no global role field**. `defaultView` (`STUDENT` | `TEACHER`) is only a
UI preference — it is never used for authorization. Every protected action is
authorized per-request against `ClassMembership` (see `server/access.ts`): a user
is a teacher *of a class* (its owner) or an active student *of a class*. The same
person can teach one class and be a student in another.

## API

All data access goes through these App Router route handlers (`app/api/**`).
Every response uses the envelope `{ success: true, data } | { success: false, error }`.
Authorization is enforced per-request in `server/access.ts`; "teacher" means the
owning teacher of that class, "student" an active member.

**Health**

- `GET /api/health` — public readiness probe (DB connectivity). `200` / `503`.

**Auth & profile**

- `POST /api/auth/register` — create an account.
- `POST /api/auth/intent` — set initial `defaultView` from the signup intent.
- `GET  /api/me` · `PATCH /api/me` — current profile + counts; update name.
- `POST /api/me/view` — persist `defaultView` (UI preference only).

**Classes**

- `GET /api/classes` · `POST /api/classes` — list owned classes / create one.
- `GET·PATCH·DELETE /api/classes/[id]` — class detail / edit / delete (teacher).
- `POST·PATCH /api/classes/[id]/invite-code` — rotate code / toggle joining (teacher).
- `GET /api/classes/[id]/members` — roster + pending requests (teacher).
- `PATCH·DELETE /api/classes/[id]/members/[mid]` — approve/deny / remove (teacher).
- `GET /api/classes/[id]/progress` — gradebook: lessons viewed × assignment status (teacher).
- `GET /api/memberships` — classes the current user is enrolled in (student).
- `POST /api/join` — request to join with an invite code (student → PENDING).

**Lessons**

- `GET·POST /api/classes/[id]/lessons` — list / create (teacher; students see published only).
- `GET·PATCH·DELETE /api/lessons/[id]` — detail / edit·reorder·publish / delete.
- `POST /api/lessons/[id]/view` — mark a lesson viewed (student, idempotent).

**Assignments & submissions**

- `GET /api/assignments` — student's cross-class "what's due" feed.
- `GET·POST /api/classes/[id]/assignments` — list / create for a class.
- `GET·PATCH·DELETE /api/assignments/[id]` — detail (incl. submissions) / edit / delete.
- `POST /api/assignments/[id]/publish` — DRAFT → PUBLISHED, notifies students.
- `POST /api/assignments/[id]/submit` — student submit / resubmit (upsert).
- `PATCH /api/submissions/[id]` — teacher grade + feedback, notifies student.

**Teacher dashboard**

- `GET /api/teacher/overview` — all owned classes with assignments, students, pending — one round trip.

**Admin panel** (`admin.thadar.com` → `/admin`; requires `SUPER_ADMIN` or `ADMIN` role)

- `GET /api/admin/overview` — platform-wide stats (users, classes, revenue).
- `GET /api/admin/users` · `GET /api/admin/users/[id]` — user directory + profile.
- `PATCH /api/admin/users/[id]` · `DELETE /api/admin/users/[id]` — edit / remove user.
- `GET /api/admin/classes` · `PATCH·DELETE /api/admin/classes/[id]` — class management.
- `GET /api/admin/queue` — join-request queue across all classes.
- `GET /api/admin/audit` — audit log.
- `GET·PATCH /api/admin/settings` — platform settings.
- `GET /api/admin/system` — server health, DB stats.

**Messaging & notifications**

- `GET·POST /api/messages` — inbox/sent/starred / send (only between classmates).
- `PATCH /api/messages/[id]` — mark read / toggle star (recipient).
- `GET /api/notifications` — list + unread count.
- `POST /api/notifications/read` — mark one or all read.

Domain events (`server/events.ts`) write the in-app notification, fire the
transactional email, and append an audit log in one call — triggered by joins,
approvals, assignment publishes, submissions, and grading.

## Deployment

Push to `main` → GitHub Actions:

1. Installs `cloudflared`
2. Loads SSH key + known_hosts from secrets
3. SSH to homelab via Cloudflare Tunnel
4. `git pull`, `npm ci`, `prisma generate`, `prisma migrate deploy`, `npm run build`, `pm2 restart thadar`

`.env` lives on homelab at `~/thadar.com/.env` (chmod 600), never committed.

## Rules

- Frontend never connects to DB directly — only through API routes
- All secrets in env vars
- App server stateless — files upload directly to MinIO via presigned URLs
- App Router only (no Pages Router)
- Prisma only (no raw SQL without documented reason)
- Atomic commits, push to `main` after every meaningful change
