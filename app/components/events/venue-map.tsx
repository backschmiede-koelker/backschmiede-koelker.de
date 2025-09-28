// /app/components/events/venue-map.tsx
"use client";

export default function VenueMap() {
  return (
    <section className="rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900/60">
      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">Wo findet's statt?</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Unsere Hauptfiliale & Backstube. Für Offsite-Events steht der genaue Ort jeweils in der Eventkarte.
        </p>
      </div>
      {/* Platzhalter – hier kannst du Traefik/NGINX Caching auf eine Tile-Map setzen */}
      <div className="h-56 w-full bg-[url('https://tile.openstreetmap.org/5/16/10.png')] bg-cover bg-center opacity-90 dark:opacity-80" />
    </section>
  );
}
