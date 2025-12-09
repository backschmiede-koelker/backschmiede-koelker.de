// lib/jobs/data.ts
import { prisma } from "@/lib/prisma";
import type {
  Job as JobModel,
  Location,
  JobEmploymentType,
  JobSalaryUnit,
  Prisma,
} from "@/generated/prisma/client";
import type { Job, Salary, EmploymentType } from "./types";

const LOCATION_LABEL: Record<Location, string> = {
  METTINGEN: "Mettingen",
  RECKE: "Recke",
};

const LABEL_TO_LOCATION: Record<string, Location> = {
  mettingen: "METTINGEN",
  recke: "RECKE",
};

const UNIT_MAP: Record<JobSalaryUnit, Salary["unitText"]> = {
  HOUR: "HOUR",
  MONTH: "MONTH",
  YEAR: "YEAR",
};

function mapSalary(
  minCents?: number | null,
  maxCents?: number | null,
  unit?: JobSalaryUnit | null
): Salary | undefined {
  if (!minCents && !maxCents) return undefined;
  return {
    currency: "EUR",
    min: minCents != null ? minCents / 100 : undefined,
    max: maxCents != null ? maxCents / 100 : undefined,
    unitText: unit ? UNIT_MAP[unit] : "MONTH",
  };
}

function mapJob(model: JobModel): Job {
  return {
    id: model.id,
    slug: model.slug,
    title: model.title,
    role: model.role ?? undefined,
    teaser: model.teaser,

    descriptionHtml: model.description,
    responsibilities: model.responsibilities,
    qualifications: model.qualifications,
    benefits: model.benefits,

    employmentType: model.employmentType as EmploymentType,
    workloadNote: model.workloadNote ?? undefined,

    locations: model.locations.map((loc) => LOCATION_LABEL[loc]),

    shift: model.shift ?? undefined,
    salary: mapSalary(model.salaryMinCents, model.salaryMaxCents, model.salaryUnit),

    startsAt: model.startsAt ?? undefined,
    startsAsap: model.startsAsap,

    datePosted: model.datePosted,
    validThrough: model.validThrough ?? undefined,

    contactEmail: model.contactEmail ?? undefined,
    contactPhone: model.contactPhone ?? undefined,
    applyUrl: model.applyUrl ?? undefined,

    isActive: model.isActive,
  };
}

export async function fetchJobs(filter?: {
  q?: string;
  loc?: string; // "Beide" | "Mettingen" | "Recke"
  role?: string; // "Alle" | Role
  includeInactive?: boolean;
}): Promise<Job[]> {
  const where: Prisma.JobWhereInput = {};

  if (!filter?.includeInactive) {
    where.isActive = true;
  }

  if (filter?.q) {
    const q = filter.q.trim();
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { teaser: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { role: { contains: q, mode: "insensitive" } },
      ];
    }
  }

  if (filter?.loc && filter.loc !== "Beide") {
    const key = filter.loc.toLowerCase();
    const locEnum = LABEL_TO_LOCATION[key];
    if (locEnum) {
      where.locations = { has: locEnum };
    }
  }

  if (filter?.role && filter.role !== "Alle") {
    where.role = filter.role;
  }

  const rows = await prisma.job.findMany({
    where,
    orderBy: { datePosted: "desc" },
  });

  return rows.map(mapJob);
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  const row = await prisma.job.findUnique({ where: { slug } });
  return row ? mapJob(row) : undefined;
}

export async function allJobs(): Promise<Job[]> {
  const rows = await prisma.job.findMany({
    where: { isActive: true },
    orderBy: { datePosted: "desc" },
  });
  return rows.map(mapJob);
}
