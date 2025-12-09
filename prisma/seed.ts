// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.deleteMany();

  const USERNAME = process.env.ADMIN_USERNAME?.trim() || null;
  const PASS = process.env.ADMIN_PASSWORD;
  if (!PASS) throw new Error("ADMIN_PASSWORD missing in .env");

  const passwordHash = await bcrypt.hash(PASS, 12);

  await prisma.user.create({
    data: {
      username: USERNAME || "admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin neu angelegt");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
