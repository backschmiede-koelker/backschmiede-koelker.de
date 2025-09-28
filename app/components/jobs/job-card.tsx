// /app/components/jobs/job-card.tsx
"use client";

import Link from "next/link";
import type { Job } from "../../lib/jobs/types";
import { employmentTypeLabel } from "@/app/components/jobs/utils";
import { locationBadge, salaryBadge } from "@/app/components/jobs/ui-parts";
import { InViewReveal } from "@/app/components/animations";

export function JobCard({ job }: { job: Job }) {
  return (
    <InViewReveal
      className={[
        "relative z-0 w-full",
        "group rounded-2xl border overflow-hidden",
        "bg-white/80 dark:bg-zinc-900/80 backdrop-blur",
        "shadow-sm transition",
        "hover:shadow-emerald-500/20 hover:shadow-lg",
      ].join(" ")}
      y={18}
      opacityFrom={0}
      visibility={{ amountEnter: 0.12, amountLeave: 0 }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />
      <div className="p-4 md:p-6 space-y-4">
        <header className="flex flex-col gap-1">
          <h3 className="text-lg md:text-xl font-extrabold tracking-tight">
            <Link href={`/jobs/${job.slug}`} className="hover:underline">
              {job.title}
            </Link>
          </h3>
          <p className="text-[13px] md:text-sm opacity-80">{job.teaser}</p>
        </header>

        <div className="flex flex-wrap gap-2 text-[11px] md:text-xs">
          <span className="rounded-full border px-2 py-1">
            💼 {employmentTypeLabel(job.employmentType)}
          </span>
          {locationBadge(job.locations)}
          {salaryBadge(job.salary)}
          {job.shift && (
            <span className="rounded-full border px-2 py-1">⏰ {job.shift}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <section className="rounded-lg border p-3 bg-emerald-50/60 dark:bg-emerald-900/10">
            <h4 className="text-sm font-semibold mb-1">Das bieten wir</h4>
            <ul className="list-disc pl-5 text-[13px] space-y-0.5">
              {job.benefits.slice(0, 5).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg border p-3">
            <h4 className="text-sm font-semibold mb-1">Dein Profil</h4>
            <ul className="list-disc pl-5 text-[13px] space-y-0.5">
              {job.qualifications.slice(0, 5).map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="flex flex-wrap items-center gap-3 text-[12px] md:text-sm">
          <span className="rounded-md bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 px-2 py-1">
            ab {job.datePosted.toLocaleDateString("de-DE")}
          </span>
          {job.validThrough && (
            <span className="opacity-70">
              Ausschreibung bis {job.validThrough.toLocaleDateString("de-DE")}
            </span>
          )}
          <div className="ms-auto flex gap-2">
            <Link
              href={`/jobs/${job.slug}`}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium border",
                "bg-emerald-600 text-white border-emerald-700/40",
                "hover:translate-y-[-1px] hover:shadow-md hover:brightness-105",
                "active:translate-y-[0px] transition",
              ].join(" ")}
            >
              Details & Bewerbung
            </Link>
          </div>
        </footer>
      </div>
    </InViewReveal>
  );
}
