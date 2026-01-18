// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin, withAdminGuard } from "@/lib/auth-guards";
import { Prisma, Location, JobEmploymentType, JobSalaryUnit, JobCategory } from "@/generated/prisma/client";
import { allJobsAdmin } from "@/app/lib/jobs/db";

function slugify(s: string) {
  return s
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "ae").replace(/Ö/g, "oe").replace(/Ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[^\w\s-]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseLocations(input: unknown): Location[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((x) => String(x).toUpperCase().trim())
    .filter((x) => x === "METTINGEN" || x === "RECKE")
    .map((x) => (x === "METTINGEN" ? Location.METTINGEN : Location.RECKE));
}

function parseEmploymentTypes(input: unknown): JobEmploymentType[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((x) => String(x).toUpperCase().trim())
    .filter((x) => x === "FULL_TIME" || x === "PART_TIME" || x === "MINI_JOB" || x === "APPRENTICESHIP") as JobEmploymentType[];
}

function parseCategory(input: unknown): JobCategory {
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
  ) {
    return s as JobCategory;
  }
  return JobCategory.SONSTIGES;
}

function parsePriority(input: unknown): number {
  if (input === null || input === undefined) return 0;
  const n = Number(input);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const adminView = searchParams.get("admin") === "1" || searchParams.get("view") === "admin";
  if (adminView) {
    const denied = await requireAdmin();
    if (denied) return denied;
    const jobs = await allJobsAdmin();
    return NextResponse.json({ items: jobs });
  }

  const q = (searchParams.get("q") || "").trim();
  const loc = (searchParams.get("loc") || "").trim();
  const cat = (searchParams.get("cat") || "").trim();
  const emp = (searchParams.get("emp") || "").trim();

  const where: Prisma.JobWhereInput = { isActive: true };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { teaser: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
    ];
  }

  if (loc) {
    const up = loc.toUpperCase();
    if (up === "METTINGEN" || up === "RECKE") {
      where.locations = { has: up === "METTINGEN" ? Location.METTINGEN : Location.RECKE };
    }
  }

  if (cat) {
    where.category = parseCategory(cat);
  }

  if (emp) {
    const parts = emp.split(",").map((s) => s.trim()).filter(Boolean);
    const enums = parts.map((p) => p.toUpperCase()).filter((p) =>
      p === "FULL_TIME" || p === "PART_TIME" || p === "MINI_JOB" || p === "APPRENTICESHIP"
    ) as JobEmploymentType[];
    if (enums.length) where.employmentTypes = { hasSome: enums };
  }

  const limitParam = parseInt(searchParams.get("limit") || "", 10);
  const take = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : undefined;

  const jobs = await getPrisma().job.findMany({
    where,
    orderBy: [
      { priority: "desc" },
      { title: "asc" },
      { id: "asc" },
    ],
    ...(take ? { take } : {}),
  });

  return NextResponse.json({ items: jobs });
}

export const POST = withAdminGuard(async (req: Request) => {
  const b = (await req.json()) as {
    title: string;
    category?: string;
    teaser: string;
    description: string;

    responsibilities?: string[];
    qualifications?: string[];
    benefits?: string[];

    employmentTypes: JobEmploymentType[];
    locations: string[];

    shift?: string | null;
    workloadNote?: string | null;

    salaryMinCents?: number | null;
    salaryMaxCents?: number | null;
    salaryUnit?: JobSalaryUnit | null;

    startsAsap?: boolean;
    startsAt?: string | null;

    validThrough?: string | null;

    applyEmail?: string | null;
    applyUrl?: string | null;
    contactPhone?: string | null;

    isActive?: boolean;

    priority?: number | null;
  };

  const baseSlug = slugify(b.title || "");
  let slug = baseSlug || "job";
  let i = 1;
  while (await getPrisma().job.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const created = await getPrisma().job.create({
    data: {
      slug,
      title: String(b.title || "").trim(),
      category: parseCategory(b.category),

      teaser: String(b.teaser || "").trim(),
      description: String(b.description || ""),

      responsibilities: Array.isArray(b.responsibilities) ? b.responsibilities.map(String) : [],
      qualifications: Array.isArray(b.qualifications) ? b.qualifications.map(String) : [],
      benefits: Array.isArray(b.benefits) ? b.benefits.map(String) : [],

      employmentTypes: parseEmploymentTypes(b.employmentTypes),
      locations: (() => {
        const locs = parseLocations(b.locations);
        return locs.length ? locs : [Location.METTINGEN, Location.RECKE];
      })(),

      shift: b.shift ? String(b.shift) : null,
      workloadNote: b.workloadNote ? String(b.workloadNote) : null,

      salaryMinCents: typeof b.salaryMinCents === "number" ? Math.max(0, Math.round(b.salaryMinCents)) : null,
      salaryMaxCents: typeof b.salaryMaxCents === "number" ? Math.max(0, Math.round(b.salaryMaxCents)) : null,
      salaryUnit: b.salaryUnit ?? null,

      startsAsap: b.startsAsap ?? true,
      startsAt: b.startsAsap ? null : b.startsAt ? new Date(b.startsAt) : null,

      validThrough: b.validThrough ? new Date(b.validThrough) : null,

      applyEmail: b.applyEmail ? String(b.applyEmail) : null,
      applyUrl: b.applyUrl ? String(b.applyUrl) : null,
      contactPhone: b.contactPhone ? String(b.contactPhone) : null,

      isActive: b.isActive ?? true,

      priority: parsePriority(b.priority),
    },
  });

  return NextResponse.json(created, { status: 201 });
});
