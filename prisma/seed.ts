import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const email = "admin@backschmiede.de"
  const passwordHash = await bcrypt.hash("admin123", 10)

  await db.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: "ADMIN" },
  })
  console.log("Admin:", email, "Passwort: admin123")
}

main().finally(() => db.$disconnect())
