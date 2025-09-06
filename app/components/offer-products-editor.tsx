// /app/components/offer-products-editor.tsx
"use client";
import { useEffect, useState } from "react";
import { OfferProductRole } from "@prisma/client";

type ProductLite = { id: string; name: string; priceCents: number; unit: string };
type Linked = {
  product: ProductLite;
  role: OfferProductRole;
  quantity: number;
  perItemPriceCents?: number | null;
};

const ROLE_LABEL: Record<OfferProductRole, string> = {
  QUALIFIER: "Muss gekauft werden",
  REWARD_FREE: "Gratis-Zugabe",
  REWARD_DISCOUNTED: "Vergünstigt",
  BUNDLE_COMPONENT: "Set-Bestandteil (Set-Preis)",
  CHOICE_QUALIFIER: "Qualifizierer (zur Wahl)",
  CHOICE_REWARD: "Belohnung (zur Wahl)",
};

export default function OfferProductsEditor({
  value, onChange,
}: { value: Linked[]; onChange: (v: Linked[]) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductLite[]>([]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!q.trim()) { setResults([]); return; }
      const res = await fetch(`/api/products?query=${encodeURIComponent(q)}&limit=8`, { cache: "no-store" });
      if (!res.ok) return;
      const { items } = await res.json();
      if (alive) setResults(items);
    };
    run();
    return () => { alive = false; };
  }, [q]);

  function add(p: ProductLite) {
    if (value.some(v => v.product.id === p.id)) return;
    onChange([...value, { product: p, role: "QUALIFIER", quantity: 1 }]);
    setQ(""); setResults([]);
  }
  function remove(id: string) { onChange(value.filter(v => v.product.id !== id)); }
  function upd(id: string, patch: Partial<Linked>) {
    onChange(value.map(v => v.product.id === id ? { ...v, ...patch } : v));
  }

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Verknüpfte Produkte</label>

      <div className="grid gap-2 sm:grid-cols-[1fr,auto]">
        <input
          className="min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
          placeholder="Produkt suchen…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {!!q && results.length > 0 && (
          <div className="sm:col-span-2 rounded-md border bg-white dark:bg-zinc-900">
            <ul className="max-h-56 overflow-auto divide-y">
              {results.map(p => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => add(p)}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs opacity-70">
                      {(p.priceCents / 100).toFixed(2)} € · {p.unit}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {value.length === 0 ? (
        <div className="text-sm opacity-70">Noch keine Produkte verknüpft.</div>
      ) : (
        <ul className="grid gap-2">
          {value.map(v => (
            <li
              key={v.product.id}
              className="grid items-center gap-2 sm:grid-cols-[1fr,auto,auto,auto,auto] rounded-md border p-2"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{v.product.name}</div>
                <div className="text-xs opacity-70">
                  {(v.product.priceCents / 100).toFixed(2)} € · {v.product.unit}
                </div>
              </div>

              <select
                className="rounded-md border px-2 py-1 bg-white dark:bg-zinc-800"
                value={v.role}
                onChange={e => upd(v.product.id, { role: e.target.value as OfferProductRole })}
                title="Rolle"
              >
                {(
                  [
                    "QUALIFIER",
                    "REWARD_FREE",
                    "REWARD_DISCOUNTED",
                    "BUNDLE_COMPONENT",
                    "CHOICE_QUALIFIER",
                    "CHOICE_REWARD",
                  ] as OfferProductRole[]
                ).map(r => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>

              <input
                type="number" min={1}
                className="w-20 rounded-md border px-2 py-1 bg-white dark:bg-zinc-800"
                value={v.quantity}
                onChange={e => upd(v.product.id, { quantity: Math.max(1, Number(e.target.value || 1)) })}
                title="Menge"
              />

              <input
                type="number" min={0}
                className="w-28 rounded-md border px-2 py-1 bg-white dark:bg-zinc-800"
                placeholder="Einzelpreis €"
                value={v.perItemPriceCents != null ? (v.perItemPriceCents / 100).toFixed(2) : ""}
                onChange={e => {
                  const val = e.target.value.trim();
                  upd(
                    v.product.id,
                    { perItemPriceCents: val === "" ? null : Math.round(Number(val.replace(",", ".")) * 100) }
                  );
                }}
                title="Optional: Einzelpreis überschreiben (für Vergünstigt)"
              />

              <button
                type="button"
                onClick={() => remove(v.product.id)}
                className="justify-self-end rounded-md px-2 py-1 text-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50 dark:text-red-400 dark:ring-red-800/60 dark:hover:bg-red-900/20"
              >
                Entfernen
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs opacity-70">
        Tipp: Set-Preis? Markiere Komponenten als „Set-Bestandteil (Set-Preis)“ und setze den Gesamtpreis im Angebot.
      </p>
    </div>
  );
}
