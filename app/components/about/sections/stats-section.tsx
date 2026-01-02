// app/components/about/sections/stats-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

export default function AboutStatsSection({ section }: { section: AboutSectionDTO }) {
  if (!section.stats?.length) return null;

  return (
    <AboutCard>
      <AboutSectionHeading title={section.title ?? "In Zahlen"} subtitle={section.subtitle} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {section.stats.map((it) => (
          <div key={it.id} className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 ring-1 ring-zinc-200/60 dark:ring-zinc-800 p-4 text-center">
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-600">
              {it.value}
            </div>
            <div className="mt-1 text-xs md:text-sm text-zinc-700 dark:text-zinc-300">{it.label}</div>
          </div>
        ))}
      </div>
    </AboutCard>
  );
}
