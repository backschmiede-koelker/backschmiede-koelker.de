// app/admin/events/events-view.tsx
"use client";

import AdminPageHeader from "@/app/admin/components/admin-page-header";
import { useEvents } from "@/app/hooks/use-events";
import NewEventForm from "./components/new-event-form";
import EventCard from "./components/event-card";

export default function AdminEventsView() {
  const { items, loading, reload, remove } = useEvents({ includeInactive: true, order: "asc" });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 py-8 md:py-12 min-w-0 overflow-x-clip">
      <AdminPageHeader
        title="Veranstaltungen"
        subtitle="Termine & Aktionen für die Timeline verwalten"
      />

      <NewEventForm onCreated={reload} />

      {/* Abstand + Caption für bestehende Termine */}
      <div className="mt-10 sm:mt-12">
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Bestehende Termine</h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Öffne einen Termin, um Bild, Datum, Text oder Status zu ändern.
          </p>
        </div>

        <ul className="space-y-3">
          <li className="text-sm text-zinc-500 min-h-[1.5rem] flex items-center">
            {loading ? "Lade…" : items.length === 0 ? "Keine Termine vorhanden." : null}
          </li>

          {items.map((e) => (
            <EventCard
              key={e.id}
              item={e}
              onSaved={reload}
              onDelete={() => remove(e.id)}
            />
          ))}
        </ul>
      </div>
    </main>
  );
}
