// app/components/about/sections/text-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

function splitParagraphs(body: string) {
  return body
    .split(/\n{2,}/) // Absätze: Leerzeilen
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function AboutTextSection({ section }: { section: AboutSectionDTO }) {
  const title = section.title?.trim() || undefined;
  const subtitle = section.subtitle?.trim() || undefined;

  const paragraphs = section.body ? splitParagraphs(section.body) : [];

  return (
    <AboutCard className="relative overflow-hidden">
      {/* Subtle editorial accents (no busy patterns) */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-500/10" />

      <div className="relative">
        <AboutSectionHeading title={title} subtitle={subtitle} />

        {paragraphs.length ? (
          <div className="mt-4">
            {/* “Editorial column” for readability on all widths (esp. 768 with sidebar) */}
            <div className="max-w-none">
              <div
                className={[
                  "prose prose-sm sm:prose-base",
                  "prose-zinc dark:prose-invert",
                  // better headings/spacing inside body if user adds them later
                  "prose-headings:tracking-tight prose-headings:font-semibold",
                  "prose-p:leading-relaxed",
                  // robust wrapping (300px safe)
                  "prose-p:whitespace-pre-line",
                  "prose-a:break-words prose-p:break-words",
                  "max-w-none",
                ].join(" ")}
              >
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="whitespace-pre-line break-words"
                  >
                    {p}
                  </p>
                ))}
              </div>

              {/* subtle divider line at end (optional, feels premium) */}
              <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-zinc-200/90 to-transparent dark:via-zinc-800/70" />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
            {/* Leerer Body ist ok - Admin kann das später pflegen */}
          </p>
        )}
      </div>
    </AboutCard>
  );
}
