// /app/components/jobs/job-list.tsx
import type { Job } from "../../lib/jobs/types";
import { JobCard } from "./job-card";
import { InitiativeCard } from "./initiative-card";

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="relative z-10 space-y-4 md:space-y-5 py-4">
      {jobs.length === 0 ? (
        <>
          <div className="rounded-2xl border p-8 text-center opacity-80 bg-white/70 dark:bg-zinc-900/70">
            Aktuell sind keine passenden Stellen online.
          </div>
          {/* Initiativ-Bewerbung IMMER unten */}
          <InitiativeCard />
        </>
      ) : (
        <>
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
          {/* Initiativ-Bewerbung IMMER unten */}
          <InitiativeCard />
        </>
      )}
    </div>
  );
}
