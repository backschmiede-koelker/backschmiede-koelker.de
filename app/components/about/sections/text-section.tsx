// app/components/about/sections/text-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

export default function AboutTextSection({ section }: { section: AboutSectionDTO }) {
  return (
    <AboutCard>
      <AboutSectionHeading title={section.title} subtitle={section.subtitle} />
      {section.body ? (
        <div className="prose prose-sm md:prose-base prose-zinc dark:prose-invert max-w-none">
          {section.body.split(/\n{2,}/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {/* Leerer Body ist ok – Admin kann das später pflegen */}
        </p>
      )}
    </AboutCard>
  );
}
