// /app/components/jobs/job-hero.tsx
"use client";

import { StaggerContainer, StaggerItem } from "@/app/components/animations";

export function JobHero() {
  return (
    <section
      className={[
        "relative border-b overflow-hidden",
        "bg-gradient-to-b from-emerald-600/15 via-emerald-500/10 to-transparent",
        "dark:from-emerald-300/15 dark:via-emerald-300/10",
      ].join(" ")}
    >
      {/* dekorative bubbles */}
      <div className="pointer-events-none absolute inset-0 opacity-30 blur-3xl">
        <div className="absolute -top-10 -left-10 h-56 w-56 rounded-full bg-emerald-400/40" />
        <div className="absolute top-10 right-0 h-48 w-48 rounded-full bg-emerald-600/30" />
      </div>

      <div className="relative mx-auto max-w-6xl px-3 md:px-4 py-10 md:py-14">
        <StaggerContainer className="flex flex-col gap-4">
          <StaggerItem>
            <h1 className="text-[28px] leading-tight md:text-4xl font-extrabold tracking-tight">
              Werde Teil unserer Bäckerei-Familie
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="max-w-2xl text-[15px] md:text-base opacity-85">
              Ob Backstube, Verkauf oder Aushilfe – bei uns zählt Teamgeist,
              Handwerk und Freude am Produkt. Profitiere von fairer Bezahlung,
              Rabatten, festen Teams und echten Entwicklungsmöglichkeiten.
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="flex flex-wrap gap-2 text-xs md:text-sm">
              {[
                "Mitarbeiterrabatte",
                "Schichtzuschläge",
                "Feste Teams",
                "Weiterbildung",
                "Sichere Jobs",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-emerald-600/30 bg-white/70 dark:bg-zinc-900/70 px-3 py-1 backdrop-blur"
                >
                  ✅ {t}
                </span>
              ))}
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
