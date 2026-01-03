// app/admin/products/products-view.tsx
"use client";

import { useMemo, useState } from "react";
import { useProducts } from "../../hooks/use-products";
import NewProductForm from "../../components/new-product-form";
import ProductCard from "../../components/product-card";
import AdminPageHeader from "../components/admin-page-header";

export default function AdminProductsView() {
  const { items, loading, reload, remove } = useProducts();

  const [q, setQ] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const allUnits = useMemo(() => {
    const s = new Set<string>(["pro Stück", "100 g", "1 kg", "Stück"]);
    items.forEach((p) => {
      if (p.unit) s.add(p.unit);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "de"));
  }, [items]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    items.forEach((p) => p.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b, "de"));
  }, [items]);

  const filtered = items.filter((p) => {
    const matchesQ =
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()));
    const matchesTags = filterTags.length === 0 || p.tags.some((t) => filterTags.includes(t));
    return matchesQ && matchesTags;
  });

  function toggleFilterTag(tag: string) {
    setFilterTags((s) => (s.includes(tag) ? s.filter((x) => x !== tag) : [...s, tag]));
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 py-8 md:py-12 min-w-0 overflow-x-clip">
      <AdminPageHeader
        title="Produkte"
        subtitle="Artikel, Preise, Einheiten & Bilder verwalten"
      />

      {/* Neues Produkt */}
      <NewProductForm allUnits={allUnits} allTags={allTags} onCreated={reload} />

      {/* **Mehr Abstand** zur Liste */}
      <div className="h-12 sm:h-16" />

      {/* Suche + Tag-Filter */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            className="w-full sm:w-80 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="Suche (Titel oder Tag)."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => {
              const active = filterTags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleFilterTag(t)}
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
            {filterTags.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterTags([])}
                className="rounded-full px-3 py-1 text-xs ring-1 bg-transparent ring-zinc-300 hover:bg-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        </div>

        {/* Kartenliste */}
        <ul className="space-y-3">
          <li className="text-sm text-zinc-500 min-h-[1.5rem] flex items-center">
            {loading ? "Lade." : filtered.length === 0 ? "Keine Produkte gefunden." : null}
          </li>

          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              allUnits={allUnits}
              onSaved={reload}
              onDelete={() => remove(p.id)}
            />
          ))}
        </ul>
      </div>
    </main>
  );
}
