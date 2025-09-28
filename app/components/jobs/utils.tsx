// /app/components/jobs/utils.tsx
import type { EmploymentType } from "../../lib/jobs/types";

export const employmentTypeLabel = (t: EmploymentType) =>
  ({
    FULL_TIME: "Vollzeit",
    PART_TIME: "Teilzeit",
    MINI_JOB: "Minijob",
    APPRENTICESHIP: "Ausbildung",
  }[t]);
