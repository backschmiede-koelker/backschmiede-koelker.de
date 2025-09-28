// /app/components/jobs/job-detail.tsx
"use client";

import Link from "next/link";
import { employmentTypeLabel } from "./utils";
import { locationBadge, salaryBadge } from "./ui-parts";
import type { Job } from "../../lib/jobs/types";
import { StaggerContainer, StaggerItem } from "@/app/components/animations";
import { ApplyCTA } from "@/app/components/jobs/cta/apply-cta";
import { Breadcrumbs } from "@/app/components/jobs/sections/breadcrumbs";

export function JobDetail({ job }: { job: Job }) {
  return (
    <article className="mx-auto max-w-6xl px-3 md:px-4 py-6 space-y-8">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Stellenangebote", href: "/jobs" },
          { name: job.title },
        ]}
      />

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-4xl font-extrabold">{job.title}</h1>
        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          <span className="rounded-full border px-2 py-1">
            💼 {employmentTypeLabel(job.employmentType)}
          </span>
          {locationBadge(job.locations)}
          {salaryBadge(job.salary)}
          {job.shift && (
            <span className="rounded-full border px-2 py-1">⏰ {job.shift}</span>
          )}
        </div>
        <p className="max-w-3xl opacity-85">{job.teaser}</p>
      </header>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StaggerItem className="md:col-span-2 space-y-6">
          <section className="rounded-2xl border bg-white/70 dark:bg-zinc-900/70 backdrop-blur p-5 space-y-3">
            <h2 className="text-lg md:text-xl font-semibold">Deine Aufgaben</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
              {job.responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border bg-white/70 dark:bg-zinc-900/70 backdrop-blur p-5 space-y-3">
            <h2 className="text-lg md:text-xl font-semibold">Dein Profil</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
              {job.qualifications.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border bg-white/70 dark:bg-zinc-900/70 backdrop-blur p-5 space-y-3">
            <h2 className="text-lg md:text-xl font-semibold">Das bieten wir</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm md:text-base">
              {job.benefits.map((b, i) => (
                <li
                  key={i}
                  className="rounded-lg border px-3 py-2 bg-emerald-50/60 dark:bg-emerald-900/10"
                >
                  ✅ {b}
                </li>
              ))}
            </ul>
          </section>
        </StaggerItem>

        <StaggerItem>
          <ApplyCTA job={job} />
          <div className="mt-4 rounded-2xl border bg-white/70 dark:bg-zinc-900/70 backdrop-blur p-4 text-sm">
            <p className="opacity-80">
              Fragen?{" "}
              <Link className="underline" href="tel:+495401000000">
                +49 5401 000000
              </Link>
            </p>
            <p className="opacity-70 mt-2">
              Veröffentlicht: {job.datePosted.toLocaleDateString("de-DE")}
            </p>
            {job.validThrough && (
              <p className="opacity-70">
                Gültig bis: {job.validThrough.toLocaleDateString("de-DE")}
              </p>
            )}
          </div>
        </StaggerItem>
      </StaggerContainer>
    </article>
  );
}
