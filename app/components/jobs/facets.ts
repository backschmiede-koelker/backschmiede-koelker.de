// app/components/jobs/facets.ts
import type { Job, JobCategory, JobEmploymentType } from "@/app/lib/jobs/types";

export type JobFacets = {
  locations: ("METTINGEN" | "RECKE")[];
  categories: JobCategory[];
  employmentTypes: JobEmploymentType[];
};

export function buildFacetsFromActiveJobs(activeJobs: Job[]): JobFacets {
  const loc = new Set<"METTINGEN" | "RECKE">();
  const cat = new Set<JobCategory>();
  const emp = new Set<JobEmploymentType>();

  for (const j of activeJobs) {
    j.locations.forEach((l) => loc.add(l));
    cat.add(j.category);
    j.employmentTypes.forEach((e) => emp.add(e));
  }

  return {
    locations: Array.from(loc),
    categories: Array.from(cat),
    employmentTypes: Array.from(emp),
  };
}
