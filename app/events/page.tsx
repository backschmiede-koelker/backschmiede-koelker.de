// app/events/page.tsx
import type { Metadata } from "next";
import EventsTimeline from "@/app/components/events/events-timeline";

export const metadata: Metadata = {
  title: "Veranstaltungen | Backschmiede Kölker",
  description: "Events & Termine der Backschmiede Kölker - Aktionen, Termine und Besonderes auf einen Blick.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Veranstaltungen | Backschmiede Kölker",
    description: "Events & Termine der Backschmiede Kölker - Aktionen, Termine und Besonderes auf einen Blick.",
    url: "/events",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="min-w-0">
      {/* Caption bleibt oben */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Veranstaltungen</h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Aktionen, Termine und Besonderes.
        </p>
      </header>

      {/* Timeline nimmt ordentlich Höhe ein & zentriert sich */}
      <section
        aria-label="Events Timeline"
        className={[
          "mt-5",
          "relative overflow-hidden rounded-3xl",
          "border border-emerald-700/20 bg-gradient-to-br from-emerald-50/80 via-white/90 to-amber-50/70",
          "shadow-sm",
          "dark:border-emerald-300/15 dark:from-emerald-900/20 dark:via-zinc-900/70 dark:to-amber-900/10",
          "p-3 sm:p-5",
          // Höhe: viel Screen, aber safe
          "h-[70dvh] min-h-[420px] lg:min-h-[520px]",
        ].join(" ")}
      >
        <EventsTimeline />
      </section>

      {/* ICS CTA */}
      <div className="mt-6 space-y-2">
        <a
          href="/api/events/ics"
          className={[
            "w-full sm:w-auto",
            "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold",
            // ✅ White mode: kontrastreicher + klarere Border + stärkerer Hover
            "bg-emerald-700 text-white shadow-sm",
            "ring-1 ring-emerald-900/20",
            "hover:bg-emerald-800 hover:shadow-md",
            "active:scale-[0.99] transition",
            // ✅ Dark mode: bleibt „glowy“, aber auch mit deutlichem Hover
            "dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-300/25",
            "dark:hover:bg-emerald-400/25 dark:hover:ring-emerald-300/35 dark:hover:shadow-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60",
          ].join(" ")}
        >
          In Kalender speichern
        </a>

        <p className="text-xs text-zinc-700 dark:text-zinc-300">
          Lade dir die <span className="font-medium">ICS-Datei</span> mit allen zukünftigen Terminen herunter und füge sie deinem Kalender hinzu.
        </p>
      </div>
    </div>
  );
}
