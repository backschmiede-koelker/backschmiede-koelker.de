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
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-950 dark:to-emerald-900 text-white p-5 md:p-10 shadow">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>

      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white text-emerald-700 px-4 md:px-5 py-2.5 text-sm font-medium shadow hover:bg-emerald-50 transition"
      >
        {label}
      </a>
    </section>
  );
}
