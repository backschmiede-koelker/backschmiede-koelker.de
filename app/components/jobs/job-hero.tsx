// app/components/jobs/job-hero.tsx
"use client";

import { useCallback } from "react";

const highlights = [
  { title: "Planbare Schichten", desc: "Klarer Plan, fairer Umgang." },
  { title: "Feste Teams", desc: "Gemeinsam statt allein." },
  { title: "Entwicklung", desc: "Einarbeitung & Perspektive." },
] as const;

export function JobHero() {
  const onScrollToInitiativ = useCallback(() => {
    const el =
      document.getElementById("initiativ") ??
      (document.querySelector('[data-initiativ="true"]') as HTMLElement | null);

    if (!el) return;

    const headerOffset = 65; 
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <section 
      className="relative overflow-hidden rounded-3xl
        border border-zinc-200/70
        bg-white/70
        shadow-lg shadow-zinc-900/20 ring-1 ring-zinc-900/15
        backdrop-blur
        dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:ring-0"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/18 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-amber-400/18 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600" />
      </div>

      <div className="relative px-4 py-7 sm:px-6 sm:py-9 md:px-8 md:py-10">
        <div className="flex flex-col gap-6">
          {/* Eyebrow */}
          <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-emerald-700/15 bg-gradient-to-r from-emerald-50/80 to-amber-50/70 px-3 py-1 text-[11px] font-medium text-zinc-900 shadow-sm dark:border-white/10 dark:from-emerald-900/20 dark:to-amber-900/15 dark:text-zinc-100">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate">Arbeiten bei Backschmiede Kölker</span>
          </div>

          {/* Headline + CTA */}
          <div className="flex flex-col gap-4">
            <div className="min-w-0">
              <h1 className="text-balance text-[1.6rem] font-extrabold tracking-tight leading-tight sm:text-4xl">
                Ein Job, der sich{" "}
                <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent">
                  gut anfühlt
                </span>
                .
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
                Backstube oder Verkauf - bei uns zählen Teamgeist, Qualität und ein fairer Umgang.
                Bewirb dich schnell & unkompliziert.
              </p>
            </div>

            <div className="flex flex-col gap-2 xs:flex-row sm:flex-row">
              <button
                type="button"
                onClick={(e) => {
                  onScrollToInitiativ();
                  // verhindert, dass der Button nach Mouse/Tap den Fokus behält
                  (e.currentTarget as HTMLButtonElement).blur();
                }}
                className="inline-flex w-full items-center justify-center rounded-xl
                  bg-gradient-to-r from-emerald-600 to-emerald-700
                  px-4 py-2.5 text-sm font-semibold text-white
                  shadow-lg shadow-emerald-600/20
                  transition
                  hover:from-emerald-700 hover:to-emerald-800
                  active:translate-y-[1px] active:shadow-md
                  focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-emerald-500/40
                  sm:w-auto"
              >
                Initiativ bewerben
              </button>
            </div>
          </div>

          {/* 3 Punkte - mobile safe */}
          <div className="grid gap-2 sm:grid-cols-3">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl border border-zinc-200/70 bg-white/60 p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900/40"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-400" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {h.title}
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {h.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
