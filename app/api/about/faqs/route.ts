// app/api/about/faqs/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdminOr401 } from "../_auth";

export async function GET(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const sectionId = (searchParams.get("sectionId") || "").trim();

  const items = await getPrisma().aboutFaqItem.findMany({
    ...(sectionId ? { where: { sectionId } } : {}),
    orderBy: [{ sectionId: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  const b = (await req.json()) as {
    sectionId: string;
    question: string;
    answer: string;
    sortOrder?: number;
  };

  if (!b.sectionId || !b.question?.trim() || !b.answer?.trim()) {
    return NextResponse.json({ error: "sectionId, question, answer required" }, { status: 400 });
  }

  const created = await getPrisma().aboutFaqItem.create({
    data: {
      sectionId: b.sectionId,
      question: b.question.trim(),
      answer: b.answer.trim(),
      sortOrder: Number.isFinite(b.sortOrder) ? (b.sortOrder as number) : 0,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
