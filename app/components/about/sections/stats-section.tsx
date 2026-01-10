// app/components/about/sections/stats-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="group relative min-w-0 h-full">
      {/* Accent frame */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-300/90 via-zinc-300/60 to-amber-300/80 dark:from-emerald-700/25 dark:via-zinc-800/40 dark:to-amber-700/18 h-full">
        <div
          className={[
            "relative overflow-hidden rounded-2xl h-full",
            "bg-white dark:bg-zinc-900/60 backdrop-blur",
            "ring-1 ring-zinc-300/80 dark:ring-zinc-800/70",
            "shadow-[0_16px_44px_rgba(0,0,0,0.12)] dark:shadow-[0_22px_60px_rgba(0,0,0,0.45)]",
            "px-3.5 sm:px-4 py-4 sm:py-5",
          ].join(" ")}
        >
          {/* subtle hover accents */}
          <div className="pointer-events-none absolute -top-10 -left-12 h-28 w-28 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-amber-200/24 blur-3xl dark:bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative flex h-full flex-col">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-normal break-words">
              {label}
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white whitespace-normal break-words">
              {value}
            </div>

            {/* fine divider */}
            <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-zinc-300/90 to-transparent dark:via-zinc-800/70" />
          </div>

          {/* top highlight line (light only) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70 dark:opacity-0" />
        </div>
      </div>
    </div>
  );
}

export default function AboutStatsSection({ section }: { section: AboutSectionDTO }) {
  if (!section.stats?.length) return null;

  return (
    <AboutCard className="relative overflow-hidden">
      <div className="relative">
        <AboutSectionHeading title={section.title ?? "In Zahlen"} subtitle={section.subtitle} />

        {/* 300px: 1 col; small phones: 2 col; 768px with sidebar: keep 2 col; wide: 4 col */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch auto-rows-fr">
          {section.stats.map((it) => (
            <StatTile key={it.id} value={it.value} label={it.label} />
          ))}
        </div>
      </div>
    </AboutCard>
  );
}
