import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const week = url.searchParams.get("week")
  const t = week ? new Date(week) : new Date()

  const day = (t.getDay() + 6) % 7
  const start = new Date(t); start.setDate(start.getDate() - day); start.setHours(0,0,0,0)
  const end   = new Date(start); end.setDate(end.getDate()+6);   end.setHours(23,59,59,999)

  const items = await prisma.offer.findMany({
    where: { isActive: true, startDate: { lte: end }, endDate: { gte: start } },
    orderBy: { startDate: "asc" },
  })
  return NextResponse.json({ from: start.toISOString(), to: end.toISOString(), items })
}
