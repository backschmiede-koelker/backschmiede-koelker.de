// lib/jobs/types.ts
export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "MINI_JOB"
  | "APPRENTICESHIP";

export type Role =
  | "Bäcker/in"
  | "Verkäufer/in"
  | "Azubi"
  | "Aushilfe"
  | string;

export type Salary = {
  currency: "EUR";
  min?: number;
  max?: number;
  unitText: "HOUR" | "MONTH" | "YEAR";
};

export type Job = {
  id: string;
  slug: string;
  title: string;
  role?: Role;
  teaser: string;

  descriptionHtml: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];

  employmentType: EmploymentType;
  workloadNote?: string | null;

  locations: string[];

  shift?: string | null;
  salary?: Salary;

  startsAt?: Date | null;
  startsAsap: boolean;

  datePosted: Date;
  validThrough?: Date | null;

  contactEmail?: string | null;
  contactPhone?: string | null;
  applyUrl?: string | null;

  isActive: boolean;
};
