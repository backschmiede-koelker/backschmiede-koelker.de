// app/admin/products/products-view.tsx
"use client";

import { useMemo, useState } from "react";
import { useProducts } from "../../hooks/use-products";
import NewProductForm from "../../components/new-product-form";
import ProductCard from "../../components/product-card";
import AdminPageHeader from "../components/admin-page-header";
import { SHOW_PRODUCT_IMAGE_MIGRATION_BUTTON } from "@/app/lib/flags";

type MigrationResult = {
  total: number;
  converted: number;
  skippedNoImage: number;
  skippedAlreadyWebp: number;
  skippedMissing: number;
  errors: Array<{ id: string; reason: string }>;
};

export default function AdminProductsView() {
  const { items, loading, reload, remove } = useProducts();

  const [q, setQ] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);

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

  async function runImageMigration() {
    if (migrationRunning) return;
    setMigrationRunning(true);
    setMigrationError(null);
    setMigrationResult(null);
    try {
      const res = await fetch("/api/admin/migrate-product-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = (await res.json()) as Partial<MigrationResult> & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Migration fehlgeschlagen.");
      }

      const result: MigrationResult = {
        total: Number(json.total ?? 0),
        converted: Number(json.converted ?? 0),
        skippedNoImage: Number(json.skippedNoImage ?? 0),
        skippedAlreadyWebp: Number(json.skippedAlreadyWebp ?? 0),
        skippedMissing: Number(json.skippedMissing ?? 0),
        errors: Array.isArray(json.errors) ? json.errors : [],
      };

      setMigrationResult(result);
      if (result.converted > 0) {
        await reload();
      }
    } catch (error) {
      console.error(error);
      setMigrationError(error instanceof Error ? error.message : "Migration fehlgeschlagen.");
    } finally {
      setMigrationRunning(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 py-8 md:py-12 min-w-0 overflow-x-clip">
      <AdminPageHeader
        title="Produkte"
        subtitle="Artikel, Preise, Einheiten & Bilder verwalten"
      />

      {SHOW_PRODUCT_IMAGE_MIGRATION_BUTTON && (
        <section className="mb-6 rounded-2xl border bg-white/90 p-4 ring-1 ring-black/5 shadow-sm dark:bg-zinc-900/80 dark:ring-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Einmalige Bild-Migration</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Konvertiert bestehende Produktbilder in WebP und aktualisiert die Produktpfade.
              </p>
            </div>
            <button
              type="button"
              onClick={runImageMigration}
              disabled={migrationRunning}
              className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
            >
              {migrationRunning ? "Konvertiere..." : "Bilder zu WebP konvertieren"}
            </button>
          </div>

          {migrationError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{migrationError}</p>
          )}

          {migrationResult && (
            <div className="mt-3 space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
              <p>
                Geprueft: {migrationResult.total}, konvertiert: {migrationResult.converted}, bereits WebP:{" "}
                {migrationResult.skippedAlreadyWebp}, kein Bild: {migrationResult.skippedNoImage}, fehlende Datei:{" "}
                {migrationResult.skippedMissing}
              </p>
              {migrationResult.errors.length > 0 && (
                <p className="text-red-600 dark:text-red-400">
                  Fehler: {migrationResult.errors.length} (erste IDs:{" "}
                  {migrationResult.errors.slice(0, 5).map((e) => e.id).join(", ")})
                </p>
              )}
            </div>
          )}
        </section>
      )}

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
