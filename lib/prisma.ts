// lib/prisma.ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type GlobalPrisma = {
  prisma?: PrismaClient;
  pool?: Pool;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // kein throw beim Import -> nur wenn wirklich benutzt
    throw new Error("DATABASE_URL is not set");
  }

  // Pool/Client einmalig erstellen
  const pool =
    globalForPrisma.pool ?? new Pool({ connectionString });

  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}

export const prisma = globalForPrisma.prisma ?? createPrisma();
