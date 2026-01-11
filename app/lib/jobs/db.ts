// app/lib/jobs/db.ts
import { getPrisma } from "@/lib/prisma";
import {
  Prisma,
  Job as PrismaJob,
  Location,
  JobEmploymentType as PrismaJobEmploymentType,
  JobCategory as PrismaJobCategory,
} from "@/generated/prisma/client";
import type {
  Job,
  JobLocation,
  JobCategory as AppJobCategory,
  JobEmploymentType as AppJobEmploymentType,
  JobSalaryUnit as AppJobSalaryUnit,
} from "./types";

function mapLocation(l: Location): JobLocation {
  return l === Location.METTINGEN ? "METTINGEN" : "RECKE";
}

function mapJob(j: PrismaJob): Job {
  return {
    id: j.id,
    slug: j.slug,
    title: j.title,
    category: j.category as AppJobCategory,

    teaser: j.teaser,
    description: j.description,

    responsibilities: j.responsibilities ?? [],
    qualifications: j.qualifications ?? [],
    benefits: j.benefits ?? [],

    employmentTypes: (j.employmentTypes ?? []) as AppJobEmploymentType[],
    locations: (j.locations ?? []).map(mapLocation),

    shift: j.shift ?? null,
    workloadNote: j.workloadNote ?? null,

    salaryMinCents: j.salaryMinCents ?? null,
    salaryMaxCents: j.salaryMaxCents ?? null,
    salaryUnit: (j.salaryUnit ?? null) as AppJobSalaryUnit | null,

    startsAsap: j.startsAsap,
    startsAt: j.startsAt ?? null,

    isActive: j.isActive,

    priority: j.priority ?? 0,

    datePosted: j.datePosted,
    validThrough: j.validThrough ?? null,

    applyEmail: j.applyEmail ?? null,
    applyUrl: j.applyUrl ?? null,
    contactPhone: j.contactPhone ?? null,
  };
}

const labelToEmployment: Record<string, PrismaJobEmploymentType> = {
  Vollzeit: "FULL_TIME",
  Teilzeit: "PART_TIME",
  Minijob: "MINI_JOB",
  Ausbildung: "APPRENTICESHIP",
};

const labelToLocation: Record<string, Location> = {
  Mettingen: Location.METTINGEN,
  Recke: Location.RECKE,
};

const labelToCategory: Record<string, PrismaJobCategory> = {
  "Bäcker/in": "BAECKER",
  "Konditor/in": "KONDITOR",
  Verkauf: "VERKAEUFER",
  Ausbildung: "AZUBI",
  Aushilfe: "AUSHILFE",
  Logistik: "LOGISTIK",
  Produktion: "PRODUKTION",
  Verwaltung: "VERWALTUNG",
  Sonstiges: "SONSTIGES",
};

export async function fetchJobs(filter?: {
  q?: string;
  loc?: string;
  cat?: string;
  emp?: string;
  activeOnly?: boolean;
}) {
  const where: Prisma.JobWhereInput = {};

  if (filter?.activeOnly !== false) {
    where.isActive = true;
  }

  const q = (filter?.q || "").trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { teaser: { contains: q, mode: Prisma.QueryMode.insensitive } },
      { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
    ];
  }

  const loc = (filter?.loc || "").trim();
  if (loc && loc !== "ALLE" && loc !== "Alle Standorte") {
    const l = labelToLocation[loc];
    if (l) where.locations = { has: l };
  }

  const cat = (filter?.cat || "").trim();
  if (cat && cat !== "ALLE" && cat !== "Alle Bereiche") {
    const c = labelToCategory[cat] || (cat.toUpperCase() as PrismaJobCategory);
    if (c) where.category = c;
  }

  const empRaw = (filter?.emp || "").trim();
  if (empRaw) {
    const parts = empRaw.split(",").map((s) => s.trim()).filter(Boolean);
    const enums = parts.map((p) => labelToEmployment[p]).filter(Boolean);
    if (enums.length) {
      where.employmentTypes = { hasSome: enums };
    }
  }

  const jobs = await getPrisma().job.findMany({
    where,
    orderBy: [
      { priority: "desc" },
      { title: "asc" },
      { id: "asc" },
    ],
  });

  return jobs.map(mapJob);
}

export async function allJobsAdmin() {
  const jobs = await getPrisma().job.findMany({
    orderBy: [
      { priority: "desc" },
      { title: "asc" },
      { id: "asc" },
    ],
  });
  return jobs.map(mapJob);
}

export async function getJobBySlug(slug: string) {
  const j = await getPrisma().job.findUnique({ where: { slug } });
  return j ? mapJob(j) : undefined;
}

export async function getJobById(id: string) {
  const j = await getPrisma().job.findUnique({ where: { id } });
  return j ? mapJob(j) : undefined;
}
