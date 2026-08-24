import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `prisma/config`'s env() throws if unset, which breaks `prisma generate`
    // at Docker build time (no DATABASE_URL there). This is only actually
    // needed by `prisma migrate deploy`, where it's set for real.
    url: process.env.DATABASE_URL,
  },
});
