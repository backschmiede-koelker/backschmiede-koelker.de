// app/components/about/sections/values-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";
import AboutCard from "../card";
import AboutSectionHeading from "../section-heading";

function ValueTile({
  title,
  description,
}: {
  title: string;
  description?: string | null;
}) {
  return (
    <div className="group relative min-w-0 h-full">
      {/* Frame (light a bit more contrast, dark more subtle) */}
      <div className="h-full rounded-2xl p-[1px] bg-zinc-300/80 dark:bg-zinc-800/70">
        <div
          className={[
            "relative h-full overflow-hidden rounded-2xl",
            // LIGHT: crisp contrast
            "bg-white ring-1 ring-zinc-300/80",
            "shadow-[0_16px_44px_rgba(0,0,0,0.12)]",
            // DARK: premium, calm
            "dark:bg-zinc-900/60 dark:ring-zinc-800/70 dark:shadow-[0_10px_24px_rgba(0,0,0,0.55)]",
          ].join(" ")}
        >
          {/* LIGHT ONLY: subtle brand accent header */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500/70 via-emerald-300/35 to-amber-300/55 dark:hidden" />

          {/* Content */}
          <div className="p-4 sm:p-5 h-full flex flex-col min-w-0">
            <h3 className="text-sm md:text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-normal break-words">
              {title}
            </h3>

            {description && (
              <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-normal break-words min-w-0">
                {description}
              </p>
            )}

            {/* Bottom separator (clean) */}
            <div className="mt-auto pt-4">
              <div className="h-px w-full bg-zinc-200/90 dark:bg-zinc-800/70" />
            </div>
          </div>

          {/* DARK ONLY: subtle emerald focus on hover instead of ribbon */}
          <div className="pointer-events-none absolute inset-0 hidden dark:block rounded-2xl ring-1 ring-emerald-400/0 group-hover:ring-emerald-300/20 transition-[box-shadow,ring-color] duration-300" />

          {/* LIGHT: gentle hover tint */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:hidden">
            <div className="absolute inset-0 bg-emerald-50/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutValuesSection({ section }: { section: AboutSectionDTO }) {
  const values = section.values ?? [];
  if (!values.length) return null;

  return (
    <AboutCard className="relative overflow-hidden">
      <div className="relative">
        <AboutSectionHeading title={section.title ?? "Unsere Werte"} subtitle={section.subtitle} />

        {/* 300px: 1 col; small phones: 2 col; 768px+sidebar: keep 2 col; wide: 3 col; very wide: 4 */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 items-stretch auto-rows-fr">
          {values.map((v) => (
            <ValueTile key={v.id} title={v.title} description={v.description} />
          ))}
        </div>
      </div>
    </AboutCard>
  );
}
