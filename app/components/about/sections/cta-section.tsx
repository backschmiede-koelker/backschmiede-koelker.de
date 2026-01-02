// app/components/about/sections/cta-section.tsx
import type { AboutSectionDTO } from "@/app/about/types";

export default function AboutCtaSection({ section }: { section: AboutSectionDTO }) {
  const href = section.body?.trim() || "/kontakt";
  const label = section.subtitle?.trim() || "Kontakt aufnehmen";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-600 dark:from-emerald-950 dark:to-emerald-900 text-white p-5 md:p-10 shadow">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight">
        {section.title ?? "Lust auf gutes Brot?"}
      </h2>
      <a
        href={href}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white text-emerald-700 px-4 md:px-5 py-2.5 text-sm font-medium shadow hover:bg-emerald-50 transition"
      >
        {label}
      </a>
    </section>
  );
}
