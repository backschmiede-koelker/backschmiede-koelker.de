// /app/components/events/rsvp-form.tsx
"use client";

export default function RsvpForm() {
  return (
    <section id="rsvp" className="rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900/60 p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Unverbindliche Vormerkung</h3>
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="grid gap-1">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Vorname</label>
          <input className="rounded-md px-3 py-2 ring-1 ring-zinc-300 bg-white dark:bg-zinc-900/60 dark:ring-zinc-700" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Nachname</label>
          <input className="rounded-md px-3 py-2 ring-1 ring-zinc-300 bg-white dark:bg-zinc-900/60 dark:ring-zinc-700" />
        </div>
        <div className="grid gap-1 sm:col-span-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">E-Mail</label>
          <input type="email" className="rounded-md px-3 py-2 ring-1 ring-zinc-300 bg-white dark:bg-zinc-900/60 dark:ring-zinc-700" />
        </div>
        <div className="grid gap-1 sm:col-span-2">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Wunsch-Event</label>
          <input placeholder="z. B. Sauerteig-Workshop 12.10." className="rounded-md px-3 py-2 ring-1 ring-zinc-300 bg-white dark:bg-zinc-900/60 dark:ring-zinc-700" />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full sm:w-auto rounded-md px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition"
          >
            Absenden
          </button>
        </div>
      </form>
    </section>
  );
}
