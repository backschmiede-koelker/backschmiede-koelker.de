// app/components/about/sections/faq-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

export default function AboutFaqSection({ section }: { section: AboutSectionDTO }) {
  if (!section.faqs?.length) return null;

  return (
    <AboutCard>
      <AboutSectionHeading title={section.title ?? "Fragen & Antworten"} subtitle={section.subtitle} />
      <div className="mt-4 space-y-3">
        {section.faqs.map((f) => (
          <details key={f.id} className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
              <span>{f.question}</span>
              <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{f.answer}</p>
          </details>
        ))}
      </div>
    </AboutCard>
  );
}
