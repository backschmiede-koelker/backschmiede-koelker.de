// app/components/about/sections/gallery-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import { publicAssetUrl } from "@/app/lib/uploads";
import AboutSectionHeading from "../section-heading";

function GalleryTile({
  src,
  alt,
}: {
  src: string;
  alt?: string | null;
}) {
  return (
    <figure className="group relative min-w-0">
      {/* Accent frame */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-200/70 via-zinc-200/40 to-amber-200/60 dark:from-emerald-700/25 dark:via-zinc-800/40 dark:to-amber-700/20">
        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-zinc-900/60 ring-1 ring-zinc-200/60 dark:ring-zinc-800/70 shadow-[0_14px_40px_rgba(0,0,0,0.10)] dark:shadow-[0_22px_60px_rgba(0,0,0,0.45)]">
          {/* Image */}
          <img
            src={src}
            alt={alt || ""}
            className="h-40 xs:h-44 sm:h-52 md:h-56 lg:h-60 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />

          {/* Subtle overlay for premium depth */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />

          {/* Bottom caption (wrap-safe, never truncate) */}
          {alt && (
            <figcaption className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3">
              <div className="min-w-0 rounded-xl bg-zinc-950/70 text-white ring-1 ring-white/10 backdrop-blur px-3 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
                <p className="text-[11px] sm:text-xs leading-snug whitespace-normal break-words">
                  {alt}
                </p>
              </div>
            </figcaption>
          )}

          {/* Tiny top highlight line (only in light, subtle) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-60 dark:opacity-0" />

          {/* Hover accent glow (keeps it classy) */}
          <div className="pointer-events-none absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/12" />
            <div className="absolute -right-10 bottom-8 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-500/10" />
          </div>
        </div>
      </div>
    </figure>
  );
}

export default function AboutGallerySection({ section }: { section: AboutSectionDTO }) {
  if (!section.gallery?.length) return null;

  return (
    <section className="relative">
      {/* Section heading */}
      <AboutSectionHeading
        title={section.title ?? "Einblicke"}
        subtitle={section.subtitle ?? "Ein paar Eindrücke aus unserer Backstube und den Filialen."}
      />

      {/* subtle background accents behind the grid */}
      <div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-28 h-80 w-80 rounded-full bg-amber-200/18 blur-3xl dark:bg-amber-500/10" />

      {/* Grid
          - 300px: 1 column (safe)
          - small phones: 2 columns
          - 768px with sidebar: keep 2 columns (less cramped)
          - wide: 3-4 columns
      */}
      <div className="relative mt-4 grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {section.gallery.map((g) => {
          const src = publicAssetUrl(g.imageUrl) ?? "/mettingen-und-recke.png";
          return <GalleryTile key={g.id} src={src} alt={g.alt} />;
        })}
      </div>
    </section>
  );
}
