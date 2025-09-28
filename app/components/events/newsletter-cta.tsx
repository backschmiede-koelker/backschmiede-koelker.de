// /app/components/events/newsletter-cta.tsx
"use client";

export default function NewsletterCta() {
  return (
    <section className={[
      "rounded-2xl p-5 sm:p-6 ring-1 ring-emerald-200/60 bg-gradient-to-br from-emerald-100 to-emerald-50",
      "dark:from-emerald-900/30 dark:to-emerald-900/10 dark:ring-emerald-800"
    ].join(" ")}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Newsletter für Genießer:innen</h3>
          <p className="text-sm text-emerald-800/90 dark:text-emerald-200/90">
            Einmal im Monat: neue Kurse, saisonale Specials, Backtipps.
          </p>
        </div>
        <form className="flex gap-2 w-full sm:w-auto">
          <input
            type="email"
            required
            placeholder="dein@email.de"
            className={[
              "min-w-0 w-full sm:w-64 rounded-md px-3 py-2 ring-1 ring-zinc-300 bg-white placeholder:text-zinc-400",
              "focus:ring-emerald-400 focus:outline-none",
              "dark:bg-zinc-900/60 dark:ring-zinc-700 dark:placeholder:text-zinc-500"
            ].join(" ")}
          />
          <button
            type="submit"
            className="shrink-0 rounded-md px-3 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition"
          >
            Abonnieren
          </button>
        </form>
      </div>
    </section>
  );
}
