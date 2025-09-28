// /app/components/events/featured-hero.tsx
"use client";

import { InViewReveal } from "../../components/animations";

export default function FeaturedHero() {
  return (
    <InViewReveal
      as="section"
      className={[
        "relative overflow-hidden rounded-2xl p-6 sm:p-8",
        "bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400",
        "dark:from-emerald-800 dark:via-emerald-700 dark:to-emerald-600",
        "text-white"
      ].join(" ")}
      y={16}
    >
      <div className="space-y-3">
        <p className="text-xs tracking-widest uppercase/loose opacity-90">Bäckerei • Handwerk • Gemeinschaft</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold">Veranstaltungen & Genussmomente</h1>
        <p className="max-w-prose text-sm sm:text-base opacity-95">
          Backkurse, Frühstücks-Specials, Hof-Feste, Kaffeeverkostungen und saisonale Aktionen.
          Entdecke, was in den nächsten Wochen bei uns passiert – vor Ort und manchmal auch online.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="/api/ics"
            className={[
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
              "bg-white/90 text-emerald-900 hover:bg-white",
              "dark:bg-emerald-900/30 dark:text-emerald-100 dark:hover:bg-emerald-900/50",
              "ring-1 ring-white/40 backdrop-blur transition"
            ].join(" ")}
          >
            📅 Kalender abonnieren (ICS)
          </a>
          <a
            href="#rsvp"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-emerald-900 text-white hover:bg-emerald-950 dark:bg-emerald-950 dark:hover:bg-black transition"
          >
            ✍️ Für ein Event vormerken
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-12 -bottom-12 size-64 rounded-full opacity-30 blur-3xl bg-white/30 dark:bg-emerald-300/20" />
    </InViewReveal>
  );
}
