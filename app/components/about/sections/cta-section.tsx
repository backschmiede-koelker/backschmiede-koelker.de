// app/components/about/sections/cta-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function AboutCtaSection({ section }: { section: AboutSectionDTO }) {
  const hrefRaw = (section.body ?? "").trim();
  const href = hrefRaw || "/kontakt";

  const label = (section.subtitle ?? "").trim() || "Kontakt aufnehmen";
  const title = (section.title ?? "").trim() || "Lust auf gutes Brot?";

  const external = isExternalUrl(href);

  return (
    <section className="relative">
      <div
        className={[
          "relative overflow-hidden rounded-3xl",
          // no blue ring - only neutral separation
          "bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)]",
          "ring-1 ring-zinc-200/80",
          "dark:bg-zinc-950/40 dark:ring-zinc-800/80 dark:shadow-[0_26px_70px_rgba(0,0,0,0.55)]",
        ].join(" ")}
      >
        {/* Accent rail (brand, slim, classy) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-emerald-500/60 to-amber-500/70 dark:from-emerald-400/35 dark:via-zinc-800/20 dark:to-amber-400/25" />

        {/* subtle inner highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/60 dark:bg-white/10" />

        <div className="p-4 sm:p-5 md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="min-w-0 text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-normal break-words">
              {title}
            </h2>

            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className={[
                // wrap-safe
                "flex flex-wrap items-center justify-center gap-x-2",
                "min-w-0 max-w-full",
                "rounded-full px-4 sm:px-5 py-2.5 text-sm font-semibold",
                // brand pill (no rings)
                "text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)]",
                "bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600",
                "hover:from-emerald-800 hover:via-emerald-700 hover:to-amber-700 transition",
                // dark tweaks
                "dark:from-emerald-500/80 dark:via-emerald-400/70 dark:to-amber-400/70",
                "dark:hover:from-emerald-500 dark:hover:via-emerald-400 dark:hover:to-amber-400",
                // focus: emerald, no blue outline
                "outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                "dark:focus-visible:ring-emerald-400/30 dark:focus-visible:ring-offset-zinc-950",
              ].join(" ")}
            >
              <span className="min-w-0 whitespace-normal break-words text-center">{label}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
