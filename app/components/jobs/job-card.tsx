// app/components/jobs/job-card.tsx
"use client";

import Link from "next/link";
import type { Job } from "@/app/lib/jobs/types";
import {
  categoryLabel,
  employmentLabel,
  locationLabel,
  salaryChipLabel,
  sortEmploymentTypes,
  startLabel,
} from "./formatters";

function joinLocations(job: Job) {
  const loc = job.locations.map(locationLabel);
  if (loc.length <= 2) return loc.join(" · ");
  return `${loc[0]} +${loc.length - 1}`;
}

export function JobCard({ job }: { job: Job }) {
  const salary = salaryChipLabel(job);
  const locations = joinLocations(job);
  const category = categoryLabel(job.category);
  const start = startLabel(job);

  const employmentSorted = sortEmploymentTypes(job.employmentTypes);

  return (
    <article
      className="group relative overflow-hidden rounded-2xl
        border border-zinc-300
        bg-gradient-to-b from-white to-zinc-100/80
        p-4
        shadow-xl shadow-zinc-900/20 ring-1 ring-zinc-900/20
        transition
        hover:-translate-y-[1px] hover:shadow-2xl hover:shadow-zinc-900/30

        dark:border-white/10
        dark:bg-white/5
        dark:from-transparent dark:to-transparent
        dark:shadow-none dark:ring-0
        dark:hover:bg-white/7

        sm:p-5"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600 opacity-90" />
      <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
          <span
            className="inline-flex max-w-full items-center gap-2 rounded-full
              border border-zinc-300
              bg-zinc-50
              px-2.5 py-1
              text-zinc-900
              shadow-sm shadow-zinc-900/10

              dark:border-white/10
              dark:bg-zinc-900/50
              dark:text-zinc-200
              dark:shadow-none"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="truncate">{category}</span>
          </span>

          <span
            className="inline-flex max-w-full items-center gap-2 rounded-full
              border border-zinc-300
              bg-zinc-50
              px-2.5 py-1
              text-zinc-900
              shadow-sm shadow-zinc-900/10

              dark:border-white/10
              dark:bg-zinc-900/50
              dark:text-zinc-200
              dark:shadow-none"
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="truncate">{locations}</span>
          </span>

          <span
            className="inline-flex max-w-full items-center gap-2 rounded-full
              border border-emerald-700/30
              bg-emerald-50
              px-2.5 py-1
              text-emerald-950
              shadow-sm shadow-emerald-900/10

              dark:border-emerald-400/20
              dark:bg-emerald-900/20
              dark:text-emerald-200
              dark:shadow-none"
          >
            <span className="truncate">{start}</span>
          </span>

          {salary && (
            <span
              className="inline-flex max-w-full items-center rounded-full
                border border-zinc-300
                bg-zinc-50
                px-2.5 py-1
                text-zinc-900
                shadow-sm shadow-zinc-900/10

                dark:border-white/10
                dark:bg-zinc-900/50
                dark:text-zinc-200
                dark:shadow-none"
              title={salary}
            >
              {/* ✅ nicht truncate → wir liefern jetzt ohnehin „35T“, damit nichts “35” wird */}
              <span className="whitespace-nowrap">{salary}</span>
            </span>
          )}
        </div>

        <h3 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
          <Link
            href={`/jobs/${job.slug}`}
            className="outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-md
              hover:underline decoration-2 underline-offset-4"
          >
            {job.title}
          </Link>
        </h3>

        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-2">
          {job.teaser}
        </p>

        <div className="mt-1 flex flex-wrap gap-2 text-[11px] sm:text-xs">
          {employmentSorted.map((t) => (
            <span
              key={t}
              className="inline-flex max-w-full items-center rounded-full
                border border-emerald-700/30
                bg-emerald-50
                px-2.5 py-1
                text-emerald-950
                shadow-sm shadow-emerald-900/10

                dark:border-emerald-400/20
                dark:bg-emerald-900/15
                dark:text-emerald-200
                dark:shadow-none"
              title={employmentLabel(t)}
            >
              <span className="truncate">{employmentLabel(t)}</span>
            </span>
          ))}

          {job.shift && (
            <span
              className="inline-flex max-w-full items-center rounded-full
                border border-zinc-300
                bg-zinc-50
                px-2.5 py-1
                text-zinc-900
                shadow-sm shadow-zinc-900/10

                dark:border-white/10
                dark:bg-zinc-900/50
                dark:text-zinc-200
                dark:shadow-none"
            >
              <span className="truncate">{job.shift}</span>
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-xs text-zinc-700 dark:text-zinc-400">
            {job.benefits?.length
              ? `✅ ${job.benefits.slice(0, 2).join(" · ")}`
              : "✅ Faire Konditionen & Teamgeist"}
          </div>

          <Link
            href={`/jobs/${job.slug}`}
            className="inline-flex w-full items-center justify-center rounded-xl
              bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-semibold text-white
              shadow-lg shadow-emerald-600/20 transition
              hover:from-emerald-700 hover:to-emerald-800
              active:translate-y-[1px] active:shadow-md
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40
              sm:w-auto"
          >
            Details ansehen
          </Link>
        </div>
      </div>
    </article>
  );
}
