import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  // Local dev: a plain SQLite file works fine. On serverless platforms
  // (Vercel, etc.) the filesystem is read-only/ephemeral outside of /tmp,
  // so DATABASE_URL must point at a hosted libSQL database instead (e.g.
  // Turso: "libsql://<db>.turso.io") with DATABASE_AUTH_TOKEN set.
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

export const db = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
