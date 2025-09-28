// /lib/jobs/types.ts
export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "MINI_JOB"
  | "APPRENTICESHIP";

export type Role =
  | "Bäcker/in"
  | "Verkäufer/in"
  | "Azubi"
  | "Aushilfe";

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
  role: Role;
  teaser: string;
  descriptionHtml: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  employmentType: EmploymentType;
  locations: string[];
  shift?: string;
  salary?: Salary;
  datePosted: Date;
  validThrough?: Date;
};
