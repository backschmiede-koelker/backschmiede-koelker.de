// app/api/jobs/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Location, JobEmploymentType, JobSalaryUnit, JobCategory } from "@/generated/prisma/client";

type JobUpdatePayload = Partial<{
  title: string;
  category: JobCategory;
  teaser: string;
  description: string;
  locations: Location[];
  employmentTypes: JobEmploymentType[];
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  shift: string | null;
  workloadNote: string | null;
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryUnit: JobSalaryUnit | null;
  startsAsap: boolean;
  startsAt: Date | null;
  validThrough: Date | null;
  applyEmail: string | null;
  applyUrl: string | null;
  contactPhone: string | null;
  isActive: boolean;
  priority: number;
}>;

function parseLocations(input: unknown): Location[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const out = input
    .map((x) => String(x).toUpperCase().trim())
    .filter((x) => x === "METTINGEN" || x === "RECKE")
    .map((x) => (x === "METTINGEN" ? Location.METTINGEN : Location.RECKE));
  return out;
}

function parseEmploymentTypes(input: unknown): JobEmploymentType[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const out = input
    .map((x) => String(x).toUpperCase().trim())
    .filter((x) => x === "FULL_TIME" || x === "PART_TIME" || x === "MINI_JOB" || x === "APPRENTICESHIP") as JobEmploymentType[];
  return out;
}

function parseCategory(input: unknown): JobCategory | undefined {
  if (input === undefined) return undefined;
  const s = String(input || "").toUpperCase().trim();
  if (
    s === "BAECKER" ||
    s === "KONDITOR" ||
    s === "VERKAEUFER" ||
    s === "AZUBI" ||
    s === "AUSHILFE" ||
    s === "LOGISTIK" ||
    s === "PRODUKTION" ||
    s === "VERWALTUNG" ||
    s === "SONSTIGES"
  ) return s as JobCategory;
  return undefined;
}

function parsePriority(input: unknown): number | undefined {
  if (input === undefined) return undefined;
  if (input === null) return 0;
  const n = Number(input);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json()) as Record<string, unknown>;
  const prev = await prisma.job.findUnique({ where: { id } });
  if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: JobUpdatePayload = {};

  if (typeof body.title === "string") data.title = body.title.trim();
  if (body.category !== undefined) data.category = parseCategory(body.category);

  if (typeof body.teaser === "string") data.teaser = body.teaser.trim();
  if (typeof body.description === "string") data.description = body.description;

  const locs = parseLocations(body.locations);
  if (locs) data.locations = locs.length ? locs : [Location.METTINGEN, Location.RECKE];

  const emps = parseEmploymentTypes(body.employmentTypes);
  if (emps) data.employmentTypes = emps;

  if (Array.isArray(body.responsibilities)) data.responsibilities = body.responsibilities.map(String);
  if (Array.isArray(body.qualifications)) data.qualifications = body.qualifications.map(String);
  if (Array.isArray(body.benefits)) data.benefits = body.benefits.map(String);

  if (typeof body.shift === "string" || body.shift === null) data.shift = body.shift ? String(body.shift) : null;
  if (typeof body.workloadNote === "string" || body.workloadNote === null) data.workloadNote = body.workloadNote ? String(body.workloadNote) : null;

  if (typeof body.salaryMinCents === "number" || body.salaryMinCents === null) {
    data.salaryMinCents = body.salaryMinCents === null ? null : Math.max(0, Math.round(body.salaryMinCents));
  }
  if (typeof body.salaryMaxCents === "number" || body.salaryMaxCents === null) {
    data.salaryMaxCents = body.salaryMaxCents === null ? null : Math.max(0, Math.round(body.salaryMaxCents));
  }
  if (body.salaryUnit === null || body.salaryUnit === undefined) {
    if (body.salaryUnit === null) data.salaryUnit = null;
  } else {
    const unit = String(body.salaryUnit || "").toUpperCase().trim();
    if (unit === "HOUR" || unit === "MONTH" || unit === "YEAR") data.salaryUnit = unit as JobSalaryUnit;
  }

  if (typeof body.startsAsap === "boolean") data.startsAsap = body.startsAsap;
  if (typeof body.startsAt === "string" || body.startsAt === null) data.startsAt = body.startsAt ? new Date(body.startsAt) : null;

  if (typeof body.validThrough === "string" || body.validThrough === null) data.validThrough = body.validThrough ? new Date(body.validThrough) : null;

  if (typeof body.applyEmail === "string" || body.applyEmail === null) data.applyEmail = body.applyEmail ? String(body.applyEmail) : null;
  if (typeof body.applyUrl === "string" || body.applyUrl === null) data.applyUrl = body.applyUrl ? String(body.applyUrl) : null;
  if (typeof body.contactPhone === "string" || body.contactPhone === null) data.contactPhone = body.contactPhone ? String(body.contactPhone) : null;

  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  const pr = parsePriority(body.priority);
  if (pr !== undefined) data.priority = pr;

  if (!Object.keys(data).length) return NextResponse.json({ error: "No fields" }, { status: 400 });

  if (data.startsAsap === true) data.startsAt = null;

  const updated = await prisma.job.update({ where: { id }, data: data as Prisma.JobUpdateInput });
  return NextResponse.json(updated);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return PATCH(req, ctx);
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
