// app/components/about/sections/timeline-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

export default function AboutTimelineSection({ section }: { section: AboutSectionDTO }) {
  if (!section.timeline?.length) return null;

  return (
    <AboutCard>
      <AboutSectionHeading title={section.title ?? "Meilensteine"} subtitle={section.subtitle} />
      <ol className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {section.timeline.map((t) => (
          <li key={t.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-xs uppercase tracking-wide text-zinc-500">{t.year}</div>
            <div className="mt-1 font-semibold">{t.title}</div>
            {t.description && <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{t.description}</p>}
          </li>
        ))}
      </ol>
    </AboutCard>
  );
}
