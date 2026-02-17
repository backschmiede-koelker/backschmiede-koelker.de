// lib/prisma.ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

export function isDatabaseConfigured() {
  if (process.env.SKIP_DB_DURING_BUILD === "1") return false;
  return !!process.env.DATABASE_URL;
}

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  // Pool auch cachen
  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      max: 5, // optional, aber empfehlenswert
    });

  globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error", "warn"], // warn in prod hilft enorm
  });

  globalForPrisma.prisma = client;
  return client;
}
