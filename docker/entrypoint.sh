#!/bin/sh
# Container entrypoint: apply pending database migrations, then start the app.
#
# Why: the deploy pipeline (CI build → docker pull → compose up) never ran
# migrations, so shipping an image with schema changes left production running
# new code against an un-migrated database. That surfaced as Auth.js
# `error=Configuration` on every login (a Prisma query referencing columns the
# DB didn't have yet). Running `migrate deploy` here makes it impossible for a
# new image to serve against a stale schema.
#
# `migrate deploy` only applies already-generated migrations (never prompts,
# never resets) and is a no-op when the DB is up to date, so it is safe on every
# start/restart. If it can't reach the DB yet (e.g. Postgres still coming up) we
# retry a few times, then exit non-zero rather than start with a stale schema —
# a crash-looping container is louder and safer than silent data corruption.
set -e

PRISMA="node node_modules/prisma/build/index.js"
SCHEMA="prisma/schema.prisma"

echo "[entrypoint] Applying database migrations (prisma migrate deploy)…"
n=0
until $PRISMA migrate deploy --schema="$SCHEMA"; do
  n=$((n + 1))
  if [ "$n" -ge 5 ]; then
    echo "[entrypoint] migrate deploy failed after $n attempts — refusing to start with a stale schema." >&2
    exit 1
  fi
  echo "[entrypoint] migrate attempt $n failed (DB not ready?); retrying in 3s…" >&2
  sleep 3
done

echo "[entrypoint] Migrations up to date. Starting server…"
exec node server.js
