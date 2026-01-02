// app/components/about/sections/values-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

export default function AboutValuesSection({ section }: { section: AboutSectionDTO }) {
  if (!section.values?.length) return null;

  return (
    <AboutCard>
      <AboutSectionHeading title={section.title ?? "Unsere Werte"} subtitle={section.subtitle} />
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {section.values.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white/60 dark:bg-white/5"
          >
            <div className="font-semibold">{v.title}</div>
            {v.description && <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{v.description}</p>}
          </div>
        ))}
      </div>
    </AboutCard>
  );
}
