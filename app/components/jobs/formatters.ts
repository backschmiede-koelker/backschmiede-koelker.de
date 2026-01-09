// app/components/jobs/formatters.ts
import type {
  Job,
  JobCategory,
  JobEmploymentType,
  JobSalaryUnit,
} from "@/app/lib/jobs/types";

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

const EMPLOYMENT_ORDER: JobEmploymentType[] = [
  "FULL_TIME",
  "PART_TIME",
  "MINI_JOB",
  "APPRENTICESHIP",
];

export function sortEmploymentTypes(types: JobEmploymentType[]) {
  const idx = new Map<JobEmploymentType, number>(
    EMPLOYMENT_ORDER.map((t, i) => [t, i])
  );
  return [...types].sort((a, b) => (idx.get(a) ?? 999) - (idx.get(b) ?? 999));
}

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function startLabel(job: Pick<Job, "startsAsap" | "startsAt">) {
  if (job.startsAsap) return "Ab sofort";
  if (job.startsAt) return `Ab ${DATE_FMT.format(new Date(job.startsAt))}`;
  return "Start nach Absprache";
}

function compactNumberDE(n: number) {
  const abs = Math.abs(n);

  if (abs >= 1_000_000) {
    const v = Math.round((n / 1_000_000) * 10) / 10;
    const s = Number.isInteger(v)
      ? v.toLocaleString("de-DE", { maximumFractionDigits: 0 })
      : v.toLocaleString("de-DE", { maximumFractionDigits: 1 });
    return `${s}M`;
  }

  if (abs >= 1_000) {
    const v = Math.round((n / 1_000) * 10) / 10;
    const s = Number.isInteger(v)
      ? v.toLocaleString("de-DE", { maximumFractionDigits: 0 })
      : v.toLocaleString("de-DE", { maximumFractionDigits: 1 });
    return `${s}T`;
  }

  return n.toLocaleString("de-DE", { maximumFractionDigits: 0 });
}

export function salaryLabel(
  job: Pick<Job, "salaryMinCents" | "salaryMaxCents" | "salaryUnit">
) {
  if (!job.salaryMinCents && !job.salaryMaxCents) return null;

  const min = job.salaryMinCents ? job.salaryMinCents / 100 : null;
  const max = job.salaryMaxCents ? job.salaryMaxCents / 100 : null;

  const unit: Record<JobSalaryUnit, string> = {
    HOUR: "Std.",
    MONTH: "Monat",
    YEAR: "Jahr",
  };

  const u = unit[job.salaryUnit || "MONTH"];

  if (min && max)
    return `${min.toLocaleString("de-DE")}-${max.toLocaleString("de-DE")} € / ${u}`;
  if (min) return `ab ${min.toLocaleString("de-DE")} € / ${u}`;
  if (max) return `bis ${max.toLocaleString("de-DE")} € / ${u}`;
  return null;
}

export function salaryChipLabel(
  job: Pick<Job, "salaryMinCents" | "salaryMaxCents" | "salaryUnit">
) {
  if (!job.salaryMinCents && !job.salaryMaxCents) return null;

  const min = job.salaryMinCents ? job.salaryMinCents / 100 : null;
  const max = job.salaryMaxCents ? job.salaryMaxCents / 100 : null;

  const unit: Record<JobSalaryUnit, string> = {
    HOUR: "Std.",
    MONTH: "Monat",
    YEAR: "Jahr",
  };
  const u = unit[job.salaryUnit || "MONTH"];

  const minS = min != null ? compactNumberDE(min) : null;
  const maxS = max != null ? compactNumberDE(max) : null;

  if (minS && maxS) return `${minS}-${maxS} € / ${u}`;
  if (minS) return `ab ${minS} € / ${u}`;
  if (maxS) return `bis ${maxS} € / ${u}`;
  return null;
}
