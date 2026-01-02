// app/components/about/sections/hero-section.tsx
import type { AboutPersonDTO, AboutSectionDTO } from "@/app/about/types";
import { publicAssetUrl } from "@/app/lib/uploads";
import AboutSectionHeading from "../section-heading";

function pickHeroImage(section: AboutSectionDTO, persons: AboutPersonDTO[]) {
  // Priorität: Section.imageUrl -> irgendein Team/Owner Avatar -> Fallback
  const fromSection = publicAssetUrl(section.imageUrl);
  if (fromSection) return fromSection;

  const anyAvatar =
    persons.find((p) => !!p.avatarUrl)?.avatarUrl ?? null;

  return publicAssetUrl(anyAvatar) ?? "/mettingen-und-recke.png";
}

export default function AboutHeroSection({
  section,
  persons,
}: {
  section: AboutSectionDTO;
  persons: AboutPersonDTO[];
}) {
  const img = pickHeroImage(section, persons);

  return (
    <section className="relative overflow-hidden rounded-3xl shadow ring-1 ring-zinc-200/60 dark:ring-zinc-800">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/40 dark:to-zinc-900" />
      <div className="relative grid gap-8 md:grid-cols-12 p-5 md:p-10">
        <div className="md:col-span-7 flex flex-col justify-center">
          <AboutSectionHeading
            eyebrow={section.subtitle ?? "Über uns"}
            title={section.title ?? "Backschmiede Kölker"}
            subtitle={section.body ?? "Handwerk, Teamgeist und gute Zutaten – jeden Tag frisch."}
          />

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="rounded-full border border-zinc-200/80 dark:border-zinc-800 px-3 py-1">
              Recke
            </span>
            <span className="rounded-full border border-zinc-200/80 dark:border-zinc-800 px-3 py-1">
              Mettingen
            </span>
            <span className="rounded-full border border-zinc-200/80 dark:border-zinc-800 px-3 py-1">
              Handwerk
            </span>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="relative overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-200/70 dark:ring-zinc-800 shadow-sm">
            <img
              src={img}
              alt={section.title ?? "Über uns"}
              className="h-[260px] md:h-[420px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
