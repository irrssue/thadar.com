import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Node runs TypeScript natively (type stripping), so no ts-node/tsx needed.
    seed: "node prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
