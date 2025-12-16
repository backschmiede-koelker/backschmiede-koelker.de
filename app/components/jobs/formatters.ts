// app/components/jobs/formatters.ts
import type { Job, JobCategory, JobEmploymentType, JobSalaryUnit } from "@/app/lib/jobs/types";

const EMPLOYMENT_LABEL: Record<JobEmploymentType, string> = {
  FULL_TIME: "Vollzeit",
  PART_TIME: "Teilzeit",
  MINI_JOB: "Minijob",
  APPRENTICESHIP: "Ausbildung",
};

const CATEGORY_LABEL: Record<JobCategory, string> = {
  BAECKER: "Bäcker/in",
  KONDITOR: "Konditor/in",
  VERKAEUFER: "Verkauf",
  AZUBI: "Ausbildung",
  AUSHILFE: "Aushilfe",
  LOGISTIK: "Logistik",
  PRODUKTION: "Produktion",
  VERWALTUNG: "Verwaltung",
  SONSTIGES: "Sonstiges",
};

export const employmentLabel = (t: JobEmploymentType) => EMPLOYMENT_LABEL[t];
export const categoryLabel = (c: JobCategory) => CATEGORY_LABEL[c];

export const locationLabel = (l: "METTINGEN" | "RECKE") =>
  l === "METTINGEN" ? "Mettingen" : "Recke";

export function startLabel(job: Pick<Job, "startsAsap" | "startsAt">) {
  if (job.startsAsap) return "Ab sofort";
  if (job.startsAt) return `Ab ${new Intl.DateTimeFormat("de-DE").format(new Date(job.startsAt))}`;
  return "Start nach Absprache";
}

export function salaryLabel(job: Pick<Job, "salaryMinCents" | "salaryMaxCents" | "salaryUnit">) {
  if (!job.salaryMinCents && !job.salaryMaxCents) return null;

  const min = job.salaryMinCents ? job.salaryMinCents / 100 : null;
  const max = job.salaryMaxCents ? job.salaryMaxCents / 100 : null;

  const unit: Record<JobSalaryUnit, string> = {
    HOUR: "Std.",
    MONTH: "Monat",
    YEAR: "Jahr",
  };

  const u = unit[job.salaryUnit || "MONTH"];

  if (min && max) return `${min.toLocaleString("de-DE")}–${max.toLocaleString("de-DE")} € / ${u}`;
  if (min) return `ab ${min.toLocaleString("de-DE")} € / ${u}`;
  if (max) return `bis ${max.toLocaleString("de-DE")} € / ${u}`;
  return null;
}
