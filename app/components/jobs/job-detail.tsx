// app/components/jobs/job-detail.tsx
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

function mailto(job: Job) {
  const mail =
    job.applyEmail ||
    process.env.NEXT_PUBLIC_MAIL_TO ||
    "info@backschmiede-koelker.de";

  return `mailto:${mail}?subject=${encodeURIComponent(`Bewerbung: ${job.title}`)}`;
}

function locShort(job: Job) {
  const loc = job.locations.map(locationLabel);
  if (loc.length <= 2) return loc.join(" · ");
  return `${loc[0]} +${loc.length - 1}`;
}

export function JobDetail({ job }: { job: Job }) {
  const salary = salaryChipLabel(job);
  const start = startLabel(job);
  const employmentSorted = sortEmploymentTypes(job.employmentTypes);

  return (
    <article className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 sm:text-sm">
        <Link className="hover:underline underline-offset-4" href="/">
          Home
        </Link>
        <span aria-hidden className="opacity-60">
          ›
        </span>
        <Link className="hover:underline underline-offset-4" href="/jobs">
          Stellenangebote
        </Link>
        <span aria-hidden className="opacity-60">
          ›
        </span>
        <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate max-w-[60vw]">
          {job.title}
        </span>
      </nav>

      <header
        className="relative overflow-hidden rounded-3xl
          border border-zinc-300/90
          bg-white/70
          shadow-lg shadow-zinc-900/20 ring-1 ring-zinc-900/20
          backdrop-blur
          dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-0"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/14 blur-3xl" />
          <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl" />
        </div>

        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                <span
                  className="inline-flex max-w-full items-center gap-2 rounded-full
                    border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-zinc-900
                    shadow-sm shadow-zinc-900/10
                    dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200 dark:shadow-none"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="truncate">{categoryLabel(job.category)}</span>
                </span>

                <span
                  className="inline-flex max-w-full items-center gap-2 rounded-full
                    border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-zinc-900
                    shadow-sm shadow-zinc-900/10
                    dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200 dark:shadow-none"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="truncate">{locShort(job)}</span>
                </span>

                <span
                  className="inline-flex max-w-full items-center gap-2 rounded-full
                    border border-emerald-700/30 bg-emerald-50 px-2.5 py-1 text-emerald-950
                    shadow-sm shadow-emerald-900/10
                    dark:border-emerald-400/20 dark:bg-emerald-900/20 dark:text-emerald-200 dark:shadow-none"
                >
                  <span className="truncate">{start}</span>
                </span>

                {salary && (
                  <span
                    className="inline-flex max-w-full items-center rounded-full
                      border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-zinc-900
                      shadow-sm shadow-zinc-900/10
                      dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200 dark:shadow-none"
                    title={salary}
                  >
                    <span className="whitespace-nowrap">{salary}</span>
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-balance text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl md:text-4xl leading-tight">
                {job.title}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
                {job.teaser}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] sm:text-xs">
                {employmentSorted.map((t) => (
                  <span
                    key={t}
                    className="inline-flex max-w-full items-center rounded-full
                      border border-emerald-700/30 bg-emerald-50 px-2.5 py-1 text-emerald-950
                      shadow-sm shadow-emerald-900/10
                      dark:border-emerald-400/20 dark:bg-emerald-900/15 dark:text-emerald-200 dark:shadow-none"
                  >
                    <span className="truncate">{employmentLabel(t)}</span>
                  </span>
                ))}
                {job.shift && (
                  <span
                    className="inline-flex max-w-full items-center rounded-full
                      border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-zinc-900
                      shadow-sm shadow-zinc-900/10
                      dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200 dark:shadow-none"
                  >
                    <span className="truncate">{job.shift}</span>
                  </span>
                )}
              </div>
            </div>

            <aside
              className="w-full lg:w-[360px]
                rounded-2xl
                border border-zinc-300/90
                bg-white/80
                shadow-md shadow-zinc-900/15 ring-1 ring-zinc-900/15
                backdrop-blur
                dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-none dark:ring-0"
            >
              <div className="p-4 sm:p-5">
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                      Schnell bewerben
                    </h2>

                    <div
                      className="hidden sm:inline-flex shrink-0 items-center rounded-full
                        border border-amber-400/80 bg-amber-100/70
                        px-2.5 py-1 text-[11px] leading-[1] font-semibold text-amber-950
                        shadow-sm shadow-amber-900/10
                        dark:border-white/10 dark:bg-amber-900/10 dark:text-amber-200 dark:shadow-none"
                    >
                      Unkompliziert
                    </div>
                  </div>

                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                    Ein paar Zeilen + Lebenslauf (PDF) reichen.
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {job.applyUrl ? (
                    <a
                      href={job.applyUrl}
                      className="inline-flex w-full items-center justify-center rounded-xl
                        bg-gradient-to-r from-emerald-600 to-emerald-700
                        px-4 py-2.5 text-sm font-semibold text-white
                        shadow-lg shadow-emerald-600/20 transition
                        hover:from-emerald-700 hover:to-emerald-800
                        active:translate-y-[1px] active:shadow-md
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      Bewerbung öffnen
                    </a>
                  ) : (
                    <a
                      href={mailto(job)}
                      className="inline-flex w-full items-center justify-center rounded-xl
                        bg-gradient-to-r from-emerald-600 to-emerald-700
                        px-4 py-2.5 text-sm font-semibold text-white
                        shadow-lg shadow-emerald-600/20 transition
                        hover:from-emerald-700 hover:to-emerald-800
                        active:translate-y-[1px] active:shadow-md
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    >
                      Bewerbung per E-Mail
                    </a>
                  )}

                  {job.contactPhone ? (
                    <a
                      href={`tel:${job.contactPhone}`}
                      className="inline-flex w-full items-center justify-center rounded-xl
                        border border-zinc-300/90 bg-white/80 px-4 py-2.5 text-sm font-semibold text-zinc-900
                        shadow-sm transition
                        hover:bg-zinc-50 hover:shadow
                        active:translate-y-[1px]
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30
                        dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800/60"
                    >
                      Fragen? Anrufen
                    </a>
                  ) : null}
                </div>

                <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                  Tipp: Schreib kurz, ab wann du starten kannst.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <section className="lg:col-span-2 space-y-4">
          <div
            className="rounded-2xl border border-zinc-300/90 bg-white/90 p-4 shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/15
              dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-0
              sm:p-5"
          >
            <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
              Über die Stelle
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
              {job.description}
            </p>
          </div>

          {job.responsibilities?.length > 0 && (
            <div
              className="rounded-2xl border border-zinc-300/90 bg-white/90 p-4 shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/15
                dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-0
                sm:p-5"
            >
              <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
                Deine Aufgaben
              </h2>
              <ul className="mt-3 grid gap-2 text-sm text-zinc-800 dark:text-zinc-300 sm:text-base">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    <span className="min-w-0">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.qualifications?.length > 0 && (
            <div
              className="rounded-2xl border border-zinc-300/90 bg-white/90 p-4 shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/15
                dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-0
                sm:p-5"
            >
              <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
                Das bringst du mit
              </h2>
              <ul className="mt-3 grid gap-2 text-sm text-zinc-800 dark:text-zinc-300 sm:text-base">
                {job.qualifications.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span className="min-w-0">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div
            className="rounded-2xl border border-zinc-300/90 bg-white/90 p-4 shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/15
              dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-0
              sm:p-5"
          >
            <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
              Das bieten wir
            </h2>

            {job.benefits?.length ? (
              <ul className="mt-3 grid gap-2 text-sm">
                {job.benefits.map((b, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-emerald-700/15 bg-emerald-50/70 px-3 py-2 text-emerald-950 shadow-sm
                      dark:border-emerald-400/20 dark:bg-emerald-900/10 dark:text-emerald-200 dark:shadow-none"
                  >
                    ✅ {b}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                Faire Konditionen, gutes Team, planbare Abläufe.
              </p>
            )}
          </div>

          <div
            className="rounded-2xl border border-zinc-300/90 bg-white/90 p-4 shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/15
              dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-0
              sm:p-5"
          >
            <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
              Kurz & klar
            </h2>

            <div className="mt-3 grid gap-2 text-sm text-zinc-800 dark:text-zinc-300">
              <div className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span className="min-w-0">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {job.locations.map(locationLabel).join(" · ")}
                  </span>
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-0.5">⏱️</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {start}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="mt-0.5">💼</span>
                <span className="min-w-0 font-semibold text-zinc-900 dark:text-zinc-100">
                  {employmentSorted.map(employmentLabel).join(" · ")}
                </span>
              </div>

              {salary && (
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">💶</span>
                  <span className="min-w-0 font-semibold text-zinc-900 dark:text-zinc-100">
                    {salary}
                  </span>
                </div>
              )}

              {job.shift && (
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">🕒</span>
                  <span className="min-w-0 font-semibold text-zinc-900 dark:text-zinc-100">
                    {job.shift}
                  </span>
                </div>
              )}

              {job.workloadNote && (
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">📝</span>
                  <span className="min-w-0 font-semibold text-zinc-900 dark:text-zinc-100">
                    {job.workloadNote}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-2xl border border-amber-300/70 bg-amber-100/60 p-4 text-sm text-zinc-800 shadow-sm
              dark:border-white/10 dark:bg-amber-900/10 dark:text-zinc-200 dark:shadow-none"
          >
            <div className="font-semibold">Hinweis</div>
            <div className="mt-1 text-sm opacity-90">
              Auch ohne Erfahrung - wir arbeiten dich ein.
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
