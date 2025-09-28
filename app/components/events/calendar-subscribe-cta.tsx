// /app/components/events/calendar-subscribe-cta.tsx
"use client";

export default function CalendarSubscribeCta() {
  return (
    <section className={[
      "rounded-2xl p-5 sm:p-6 ring-1 ring-emerald-200/60 bg-emerald-50",
      "dark:bg-emerald-900/20 dark:ring-emerald-800"
    ].join(" ")}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Immer auf dem Laufenden</h3>
          <p className="text-sm text-emerald-800/90 dark:text-emerald-200/90">
            Abonniere alle Events als iCalendar (ICS). Kompatibel mit Apple, Google & Outlook.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/ics"
            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition"
          >
            📥 ICS abonnieren
          </a>
          <a
            href="/api/events"
            className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium bg-white text-emerald-900 hover:bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:hover:bg-emerald-900/60 dark:ring-emerald-800 transition"
          >
            JSON API
          </a>
        </div>
      </div>
    </section>
  );
}
