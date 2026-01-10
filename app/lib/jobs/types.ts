// app/lib/jobs/types.ts
export type JobEmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "MINI_JOB"
  | "APPRENTICESHIP";

export type JobSalaryUnit = "HOUR" | "MONTH" | "YEAR";

export type JobCategory =
  | "BAECKER"
  | "KONDITOR"
  | "VERKAEUFER"
  | "AZUBI"
  | "AUSHILFE"
  | "LOGISTIK"
  | "PRODUKTION"
  | "VERWALTUNG"
  | "SONSTIGES";

export type JobLocation = "METTINGEN" | "RECKE";

export type Job = {
  id: string;
  slug: string;

  title: string;
  category: JobCategory;

  teaser: string;
  description: string;

  responsibilities: string[];
  qualifications: string[];
  benefits: string[];

  employmentTypes: JobEmploymentType[];
  locations: JobLocation[];

  shift?: string | null;
  workloadNote?: string | null;

  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryUnit?: JobSalaryUnit | null;

  startsAsap: boolean;
  startsAt?: Date | null;

  isActive: boolean;

  priority: number;

  datePosted: Date;
  validThrough?: Date | null;

  applyEmail?: string | null;
  applyUrl?: string | null;
  contactPhone?: string | null;
};
