import type { Job } from "@/app/lib/jobs/types";
import { JobCard } from "./job-card";
import { InitiativeCard } from "./initiative-card";

export function JobList({ jobs }: { jobs: Job[] }) {
  const hasJobs = jobs.length > 0;

  return (
    <section id="jobs" className="py-4">
      {/* Headerzeile */}
      <div className="mb-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
            Offene Stellen
          </h2>
          <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
            {hasJobs ? `${jobs.length} Treffer` : "Aktuell keine passenden Stellen online."}
          </p>
        </div>

        {/* kleines Badge mit Anzahl - fällt auf Mobile automatisch weg, wenn kein Platz */}
        <div className="hidden sm:inline-flex shrink-0 items-center rounded-full border border-zinc-200/70 bg-white/70 px-3 py-1 text-xs text-zinc-700 shadow-sm dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200">
          {hasJobs ? `${jobs.length} Jobs` : "0 Jobs"}
        </div>
      </div>

      {/* Liste */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {!hasJobs ? (
          <>
            <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/10 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-0">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Keine Treffer
              </div>
              <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                Schau später nochmal rein oder bewirb dich direkt initiativ.
              </div>
            </div>
            <InitiativeCard />
          </>
        ) : (
          <>
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
            <InitiativeCard />
          </>
        )}
      </div>
    </section>
  );
}
