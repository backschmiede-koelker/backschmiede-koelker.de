// app/components/about/sections/timeline-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

function TimelineItem({
  year,
  title,
  description,
  isLast,
}: {
  year: string;
  title: string;
  description?: string | null;
  isLast: boolean;
}) {
  return (
    <li className="relative pl-6 min-w-0 h-full">
      {/* vertical line */}
      {!isLast && (
        <div className="pointer-events-none absolute left-[11px] top-8 bottom-0 w-px bg-gradient-to-b from-zinc-400/90 via-zinc-300/70 to-transparent dark:from-zinc-700/70 dark:via-zinc-800/40" />
      )}

      {/* dot */}
      <div className="pointer-events-none absolute left-[6px] top-[10px] h-3 w-3 rounded-full bg-emerald-600 dark:bg-emerald-400/90 shadow-[0_0_0_7px_rgba(16,185,129,0.18)] dark:shadow-[0_0_0_6px_rgba(16,185,129,0.16)]" />

      {/* card */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-300/85 via-zinc-300/55 to-amber-300/70 dark:from-emerald-700/22 dark:via-zinc-800/40 dark:to-amber-700/16 h-full">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/60 backdrop-blur ring-1 ring-zinc-300/80 dark:ring-zinc-800/70 shadow-[0_12px_34px_rgba(0,0,0,0.07)] dark:shadow-[0_20px_55px_rgba(0,0,0,0.40)] px-4 py-4 h-full">
          {/* year pill */}
          <div className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/70 dark:bg-zinc-800/60 dark:text-zinc-200 dark:ring-zinc-700/60">
            {year}
          </div>

          <div className="mt-2 text-sm md:text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-normal break-words">
            {title}
          </div>

          {description && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-normal break-words">
              {description}
            </p>
          )}

          {/* top highlight line (light only) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70 dark:opacity-0" />
        </div>
      </div>
    </li>
  );
}

export default function AboutTimelineSection({ section }: { section: AboutSectionDTO }) {
  const items = section.timeline ?? [];
  if (!items.length) return null;

  return (
    <AboutCard className="relative overflow-hidden">
      <div className="relative">
        <AboutSectionHeading title={section.title ?? "Meilensteine"} subtitle={section.subtitle} />

        {/* 300px: 1 col (vertical timeline)
            small phones: 2 cols
            768px + sidebar: keep 2 cols
            wide: 3 cols
        */}
        <ol className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch auto-rows-fr">
          {items.map((t, idx) => (
            <TimelineItem
              key={t.id}
              year={t.year}
              title={t.title}
              description={t.description}
              isLast={idx === items.length - 1}
            />
          ))}
        </ol>
      </div>
    </AboutCard>
  );
}
