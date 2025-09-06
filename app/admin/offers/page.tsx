// /app/admin/offers/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useOffers } from "@/app/hooks/use-offers";
import NewOfferForm from "@/app/components/new-offer-form";
import OfferCard from "@/app/components/offer-card";
import { Offer, Location, OfferKind } from "@prisma/client";

export default function AdminOffers() {
  const { items, loading, reload, remove } = useOffers();

  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [locFilter, setLocFilter] = useState<Location[]>([]);
  const [kindFilter, setKindFilter] = useState<OfferKind | "">("");
  const [sortByPrio, setSortByPrio] = useState(true);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    items.forEach(o => o.tags?.forEach(t => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b, "de"));
  }, [items]);

  const allUnits = useMemo(() => {
    const s = new Set<string>(["pro Stück", "100 g", "1 kg", "Stück"]);
    items.forEach(o => { if (o.unit) s.add(o.unit); });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "de"));
  }, [items]);

  const filtered = useMemo(() => {
    const base = items.filter((o: Offer) => {
      const qMatch =
        !q ||
        o.title.toLowerCase().includes(q.toLowerCase()) ||
        (o.tags ?? []).some(t => t.toLowerCase().includes(q.toLowerCase()));

      const tagMatch =
        tagFilter.length === 0 || (o.tags ?? []).some(t => tagFilter.includes(t));

      const locMatch =
        locFilter.length === 0 || (o.locations ?? []).some(l => locFilter.includes(l as Location));

      const kindMatch = !kindFilter || o.kind === kindFilter;

      return qMatch && tagMatch && locMatch && kindMatch;
    });

    if (!sortByPrio) return base;
    return [...base].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [items, q, tagFilter, locFilter, kindFilter, sortByPrio]);

  function toggleTag(t: string) {
    setTagFilter(s => (s.includes(t) ? s.filter(x => x !== t) : [...s, t]));
  }

  function toggleLoc(l: Location) {
    setLocFilter(s => (s.includes(l) ? s.filter(x => x !== l) : [...s, l]));
  }

  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Angebote</h1>
      </header>

      {/* Neues Angebot */}
      <NewOfferForm allUnits={allUnits} allTags={allTags} onCreated={reload} />

      {/* Abstand zur Liste */}
      <div className="h-12 sm:h-16" />

      {/* Filterzeile */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <input
            className="w-full sm:max-w-xs rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="Suche (Titel oder Tag)…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 min-w-0">
            {/* Standort-Filter */}
            {([Location.RECKE, Location.METTINGEN] as const).map(l => {
              const active = locFilter.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLoc(l)}
                  className={[
                    "rounded-full px-3 py-1 text-xs ring-1",
                    active
                      ? "bg-emerald-100 ring-emerald-300 text-emerald-900 dark:bg-emerald-900/30 dark:ring-emerald-700 dark:text-emerald-200"
                      : "bg-zinc-100 ring-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-200",
                  ].join(" ")}
                >
                  {l === Location.RECKE ? "Recke" : "Mettingen"}
                </button>
              );
            })}

            {/* Art (Kind) */}
            <select
              className="rounded-full px-3 py-1 text-xs ring-1 bg-white ring-zinc-300 dark:bg-zinc-800 dark:ring-zinc-700"
              value={kindFilter}
              onChange={e => setKindFilter(e.target.value as OfferKind | "")}
            >
              <option value="">Alle Arten</option>
              <option value={OfferKind.DATE_RANGE}>Zeitraum</option>
              <option value={OfferKind.ONE_DAY}>Ein Tag</option>
              <option value={OfferKind.RECURRING_WEEKDAY}>Wöchentlich</option>
            </select>

            {/* Tag-Filter */}
            {allTags.map(t => {
              const active = tagFilter.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={[
                    "rounded-full px-3 py-1 text-xs ring-1",
                    active
                      ? "bg-amber-100 ring-amber-300 text-amber-900 dark:bg-amber-900/30 dark:ring-amber-700 dark:text-amber-200"
                      : "bg-zinc-100 ring-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-200",
                  ].join(" ")}
                >
                  {t}
                </button>
              );
            })}

            {(tagFilter.length > 0 || locFilter.length > 0 || !!kindFilter) && (
              <button
                type="button"
                onClick={() => { setTagFilter([]); setLocFilter([]); setKindFilter(""); }}
                className="rounded-full px-3 py-1 text-xs ring-1 bg-transparent ring-zinc-300 hover:bg-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        </div>

        {/* Sortierung */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sortByPrio} onChange={e => setSortByPrio(e.target.checked)} />
            nach Priorität sortieren
          </label>
        </div>

        {/* Kartenliste */}
        <ul className="space-y-3">
          <li className="text-sm text-zinc-500 min-h-[1.5rem] flex items-center">
            {loading ? "Lade…" : filtered.length === 0 ? "Keine Angebote gefunden." : null}
          </li>

          {filtered.map(o => (
            <OfferCard
              key={o.id}
              offer={o}
              allUnits={allUnits}
              onSaved={reload}
              onDelete={() => remove(o.id)}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}
