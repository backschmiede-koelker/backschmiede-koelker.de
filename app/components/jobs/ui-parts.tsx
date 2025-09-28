// /app/components/jobs/ui-parts.tsx
import type { Salary } from "../../lib/jobs/types";

export function locationBadge(locations: string[]) {
  return (
    <span className="rounded-full border px-2 py-1">
      📍 {locations.join(", ")}
    </span>
  );
}

export function salaryBadge(salary?: Salary) {
  if (!salary) return null;
  const unit =
    salary.unitText === "MONTH"
      ? "Monat"
      : salary.unitText === "HOUR"
      ? "Std."
      : "Jahr";
  return (
    <span className="rounded-full border px-2 py-1">
      💶 {salary.currency} {salary.min?.toLocaleString("de-DE")}–
      {salary.max?.toLocaleString("de-DE")} / {unit}
    </span>
  );
}
