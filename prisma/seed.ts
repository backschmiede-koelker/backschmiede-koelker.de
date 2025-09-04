import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // delete all users -> only one admin is allowed
  await prisma.user.deleteMany();

  const USERNAME = process.env.ADMIN_USERNAME?.trim() || null;
  const PASS     = process.env.ADMIN_PASSWORD;
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
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
