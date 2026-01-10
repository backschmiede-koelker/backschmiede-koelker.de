// /app/components/product-picker.tsx
"use client";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaMagnifyingGlass, FaSpinner } from "react-icons/fa6";

type ProductLite = {
  id: string;
  name: string;
  priceCents: number;
  unit: string;
  tags?: string[];
};

export default function ProductPicker({
  value,
  onChange,
  label = "Produkt",
}: {
  value: ProductLite | null;
  onChange: (p: ProductLite | null) => void;
  label?: string;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const listboxId = useId();
  const inputId = useId();
  const statusId = useId();

  function parseProductsJson(json: any): ProductLite[] {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.items)) return json.items;
    return [];
  }

  async function fetchProducts(term: string): Promise<ProductLite[]> {
    const url = term
      ? `/api/products?query=${encodeURIComponent(term)}&limit=50`
      : `/api/products?limit=50`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return parseProductsJson(json);
  }

  // Initial: Liste laden
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const items = await fetchProducts("");
        if (alive) setResults(items);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Debounced Suche
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const srv = await fetchProducts(q.trim());
        if (!alive) return;
        const term = q.trim().toLowerCase();
        const filtered = term
          ? srv.filter(
              (p) =>
                p.name?.toLowerCase().includes(term) ||
                (p.tags || []).some((t) => t?.toLowerCase().includes(term)),
            )
          : srv;
        setResults(filtered);
        setHighlight(filtered.length ? 0 : -1);
      } finally {
        if (alive) setLoading(false);
      }
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  // Outside-Click (inkl. Portal)
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      const insideWrapper = wrapperRef.current?.contains(t);
      const insidePop = popRef.current?.contains(t);
      if (!insideWrapper && !insidePop) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // ==== Floating / Positionierung ====
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; maxH: number; place: "bottom" | "top" }>({
    top: 0,
    left: 0,
    width: 0,
    maxH: 240,
    place: "bottom",
  });

  function updatePosition() {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const minGap = 8;
    const spaceBelow = vh - r.bottom - minGap;
    const spaceAbove = r.top - minGap;
    const preferBottom = spaceBelow >= 180 || spaceBelow >= spaceAbove;

    const maxH = Math.max(140, Math.min(320, preferBottom ? spaceBelow : spaceAbove));
    const left = Math.max(8, Math.min(r.left, vw - 8 - r.width));

    setCoords({
      top: preferBottom ? r.bottom + minGap : r.top - minGap,
      left,
      width: Math.min(r.width, vw - 16), // schützt auf sehr schmalen Screens
      maxH,
      place: preferBottom ? "bottom" : "top",
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    const ro = new ResizeObserver(() => updatePosition());
    if (inputRef.current) ro.observe(inputRef.current);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Tastatursteuerung
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
    }
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      if (open && highlight >= 0) {
        e.preventDefault();
        select(results[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function select(p: ProductLite) {
    onChange(p);
    setQ("");
    setOpen(false);
    setHighlight(-1);
  }

  const placeholder = useMemo(
    () => (value ? value.name : "Produkt suchen oder auswählen…"),
    [value],
  );

  return (
    <div ref={wrapperRef} className="space-y-1 w-full max-w-full">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>

      <div className="grid gap-2 sm:grid-cols-[1fr,auto]">
        <div className="relative">
          <input
            id={inputId}
            ref={inputRef}
            className="min-w-0 w-full rounded-md border px-3 py-2 pr-9 bg-white text-zinc-900 dark:text-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-amber-400 outline-none transition"
            placeholder={placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              setOpen(true);
              setTimeout(updatePosition, 0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && highlight >= 0 ? `${listboxId}-opt-${highlight}` : undefined
            }
            aria-busy={loading}
            aria-describedby={statusId}
          />
          {/* Trailing icon / loader - kontrastreich im Dark Mode */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            {loading ? (
              <FaSpinner
                aria-hidden="true"
                className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400"
              />
            ) : (
              <FaMagnifyingGlass aria-hidden="true" className="h-4 w-4 opacity-60" />
            )}
          </div>
          <span id={statusId} className="sr-only" aria-live="polite">
            {loading ? "Produkte werden geladen…" : ""}
          </span>
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
          >
            Auswahl löschen
          </button>
        )}
      </div>

      {value && (
        <div className="rounded-md bg-zinc-50 p-2 text-xs ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
          Gewählt: <b>{value.name}</b> · {(value.priceCents / 100).toFixed(2)} € / {value.unit}
        </div>
      )}

      {/* === Portal Dropdown (layout-stabil, auch mit Sidebar) === */}
      {open &&
        createPortal(
          <div
            ref={popRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              maxHeight: coords.maxH,
            }}
            className={[
              "z-50 overflow-auto rounded-xl border shadow-xl backdrop-blur",
              "bg-white/95 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-700",
              "ring-1 ring-black/5 dark:ring-white/10",
              "animate-in fade-in-0 zoom-in-95",
              coords.place === "top" ? "origin-bottom" : "origin-top",
            ].join(" ")}
          >
            <ul
              id={listboxId}
              role="listbox"
              aria-label={label}
              className="divide-y divide-zinc-100 dark:divide-zinc-800"
            >
              {results.length > 0 ? (
                results.map((p, i) => {
                  const active = i === highlight;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        id={`${listboxId}-opt-${i}`}
                        role="option"
                        aria-selected={active}
                        className={[
                          "w-full text-left px-3 py-2.5 transition",
                          active
                            ? "bg-amber-50/80 dark:bg-amber-900/25"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                        ].join(" ")}
                        onMouseDown={(e) => e.preventDefault()} // verhindert Blur vor Click
                        onMouseEnter={() => setHighlight(i)}
                        onClick={() => select(p)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate font-medium">{p.name}</div>
                            <div className="text-xs opacity-75">
                              {(p.priceCents / 100).toFixed(2)} € · {p.unit}
                              {p.tags?.length ? ` · ${p.tags.join(", ")}` : ""}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-2 text-sm text-zinc-500">Keine Treffer</li>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
