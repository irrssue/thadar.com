# Stage 1: install dependencies only (cached on lockfile change)
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: build
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma.config.ts calls env("DATABASE_URL") at load time even during generate.
# Provide a placeholder so the config loader is satisfied — no real DB needed at build.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate
RUN npm run build

# Stage 3: production runner
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Migration tooling — lets the entrypoint run `prisma migrate deploy` on start so
# a new image can never serve against an un-migrated database. The Next.js
# standalone output ships only the traced runtime deps (no Prisma CLI, schema or
# migration engine), so copy those in explicitly: the schema + migrations, the
# `prisma` CLI (node_modules/prisma/build/index.js), and the @prisma scope which
# carries @prisma/engines (the schema/migration engine).
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh

USER nextjs
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Apply migrations, then start the server (see docker/entrypoint.sh).
CMD ["./docker/entrypoint.sh"]
