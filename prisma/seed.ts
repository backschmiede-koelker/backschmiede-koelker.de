// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const rawUsername = process.env.ADMIN_USERNAME;
const rawPassword = process.env.ADMIN_PASSWORD;

const ADMIN_USERNAME = rawUsername?.trim() ?? "";
const ADMIN_PASSWORD = rawPassword?.trim() ?? "";

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.log(
    "[seed] Skipping: ADMIN_USERNAME and ADMIN_PASSWORD must both be set (non-empty).",
  );
  process.exit(0);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany();

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await tx.user.create({
      data: {
        username: ADMIN_USERNAME,
        passwordHash,
        role: "ADMIN",
      },
    });
  });

  console.log(`[seed] Admin user reset/created: ${ADMIN_USERNAME}`);
}

main()
  .catch((e) => {
    console.error("[seed] Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end().catch(() => {});
  });
