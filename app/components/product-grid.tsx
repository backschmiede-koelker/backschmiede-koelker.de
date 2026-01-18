// app/components/product-grid.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SelectBox from "./select-box";
import { publicAssetUrl } from "@/app/lib/uploads";
import { ALLERGEN_LABEL, type Allergen } from "@/app/lib/allergens";

type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  unit: string;
  imageUrl?: string | null;
  tags: string[];
  allergens: Allergen[];
  updatedAt: string;
};

type SortKey = "name_asc" | "newest";

const euro = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs ring-1 ring-amber-300 text-amber-900 dark:bg-amber-900/30 dark:ring-amber-700 dark:text-amber-200 lg:px-3 lg:py-1 lg:text-sm">
      {label}
      <button aria-label={`Tag ${label} entfernen`} onClick={onRemove} className="-mr-0.5 rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10">
        <svg width="12" height="12" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
    </span>
  );
}

export default function ProductGrid() {
  const [items, setItems] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initRef = useRef(false);

  const [q, setQ] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("name_asc");

  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        const res = await fetch("/api/products?active=true", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        setStatus("ok");
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    })();
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const sp = new URLSearchParams(searchParams?.toString());
    setQ(sp.get("q") || "");
    setSelectedTags(sp.get("tags")?.split(",").filter(Boolean) || []);
    setSort(((sp.get("sort") as SortKey) || "name_asc"));
  }, [searchParams]);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (selectedTags.length) sp.set("tags", selectedTags.join(","));
    if (sort !== "name_asc") sp.set("sort", sort);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [q, selectedTags, sort, pathname, router]);

  const tagFacet = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of items) for (const t of p.tags || []) m.set(t, (m.get(t) || 0) + 1);
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], "de"));
  }, [items]);

  const qDeb = useDebounced(q);

  const filtered = useMemo(() => {
    const ql = qDeb.trim().toLowerCase();
    return items
      .filter((p) => {
        const inQuery = !ql || p.name.toLowerCase().includes(ql) || p.tags.some((t) => t.toLowerCase().includes(ql));
        const inTags = selectedTags.length === 0 || p.tags.some((t) => selectedTags.includes(t));
        return inQuery && inTags;
      })
      .sort((a, b) => {
        if (sort === "name_asc") return a.name.localeCompare(b.name, "de");
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [items, qDeb, selectedTags, sort]);

  function addTagFromSelect(tag: string) {
    if (!tag) return;
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  }

  function removeTag(tag: string) {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }

  function resetAll() {
    setQ("");
    setSelectedTags([]);
    setSort("name_asc");
  }

  const tagOptions = tagFacet.map(([t]) => t).filter((t) => !selectedTags.includes(t));

  return (
    <div className="space-y-5">
      <div className="rounded-b-none bg-transparent">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1fr]">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Suche (Titel oder Tag)…"
                className="w-full rounded-md border px-3 py-2 pl-9 bg-white dark:bg-zinc-800 dark:border-zinc-700"
              />
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </div>

            <div className="min-w-0">
              <SelectBox
                value=""
                onChange={(v) => addTagFromSelect(v)}
                options={tagOptions.length ? tagOptions : ["(Keine weiteren Tags)"]}
                placeholder="Tag hinzufügen…"
                ariaLabel="Tag auswählen"
                disabled={tagOptions.length === 0}
              />
            </div>

            <div className="min-w-0">
              <SelectBox
                value={sort === "name_asc" ? "Name A-Z" : "Neueste"}
                onChange={(v) => setSort(v === "Neueste" ? "newest" : "name_asc")}
                options={["Name A-Z", "Neueste"]}
                ariaLabel="Sortierung"
              />
            </div>
          </div>

          <div className="flex items-center justify-start pt-1">
            <button
              onClick={resetAll}
              className="rounded-md px-3 py-1.5 text-sm text-zinc-700 underline underline-offset-4 hover:text-zinc-900 dark:text-amber-300 dark:hover:text-white"
            >
              Zurücksetzen
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 -mx-2 sm:mx-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-2 dark:bg-zinc-900/70">
        <div className="px-2 sm:px-0">
          <div className="flex flex-wrap items-center gap-3 min-h-[0.5rem]">
            {selectedTags.map((t) => (
              <TagChip key={t} label={t} onRemove={() => removeTag(t)} />
            ))}
            {!selectedTags.length && <span className="text-xs text-zinc-500">Keine Tags ausgewählt</span>}
          </div>
        </div>
      </div>

      <div className="text-sm text-zinc-600 dark:text-zinc-300">
        {{
          loading: "Lade…",
          error: "Fehler beim Laden.",
          ok:
            items.length === 0
              ? "Keine Produkte gefunden."
              : (filtered.length === 0
                  ? "Keine Treffer für deine Suche/Filter."
                  : `${filtered.length} von ${items.length} Produkten`)
        }[status]}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const img = publicAssetUrl(p.imageUrl);
          return (
            <div
              key={p.id}
              className="group overflow-hidden rounded-xl border bg-white ring-1 ring-zinc-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:ring-amber-200 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-zinc-700 dark:transition dark:hover:bg-zinc-800/80 dark:hover:ring-amber-400/30"
            >
              <div className="h-44 w-full bg-zinc-100 dark:bg-zinc-800 grid place-items-center overflow-hidden">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={p.name}
                    className="h-44 w-full object-cover transition group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 px-3 text-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-70">
                      <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 17l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M14.5 8.5h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-snug break-words">
                      Kein Bild hinterlegt
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{p.tags.join(" · ")}</p>
                {p.allergens?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.allergens.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-emerald-50 px-1 py-0.5 text-[10px] ring-1 ring-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:ring-emerald-800/60 dark:text-emerald-200"
                        title="Allergen"
                      >
                        {ALLERGEN_LABEL[a] ?? a}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 font-medium">
                  {euro(p.priceCents / 100)}{p.unit && <span className="text-sm opacity-70"> / {p.unit}</span>}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Aktualisiert {new Intl.DateTimeFormat("de-DE").format(new Date(p.updatedAt))}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
