// app/components/about/sections/gallery-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import { publicAssetUrl } from "@/app/lib/uploads";
import AboutSectionHeading from "../section-heading";

export default function AboutGallerySection({ section }: { section: AboutSectionDTO }) {
  if (!section.gallery?.length) return null;

  return (
    <section>
      <AboutSectionHeading title={section.title ?? "Einblicke"} subtitle={section.subtitle} />
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {section.gallery.map((g) => {
          const src = publicAssetUrl(g.imageUrl) ?? "/mettingen-und-recke.png";
          return (
            <figure
              key={g.id}
              className="group relative overflow-hidden rounded-2xl shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 bg-zinc-50 dark:bg-zinc-900"
            >
              <img
                src={src}
                alt={g.alt || ""}
                className="h-40 sm:h-48 md:h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {g.alt && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6 text-[11px] text-white">
                  {g.alt}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
