// app/admin/offers/multibuy-form.tsx
import React, { useState } from "react";
import FieldLabel from "@/app/components/ui/field-label";
import ProductPicker from "@/app/components/product-picker";
import { PRICE_RE, euro } from "@/app/lib/format";

type ProductLite = { id: string; name: string; priceCents: number; unit: string };

type State = {
  product: ProductLite | null;
  qty: string;
  price: string;
  compareQty: string;
  comparePrice: string;
  unit: string;
};

export default function MultibuyForm({
  value,
  onChange,
  allUnits,
  preview,
}: {
  value: State;
  onChange: (v: State) => void;
  allUnits: string[];
  preview: null | { qty: number; nowCents: number; oldQty?: number; oldCents?: number };
}) {
  // Custom-Einheit Inline, unter der Zeile (vollbreit)
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");

  return (
    <div className="rounded-xl border p-3 grid gap-3">
      <div className="font-medium">Mehr für weniger</div>
      <div className="text-xs text-zinc-600">
        Ideal für „Menge <b>Einheit</b> für X €“. Beispiel: „5 <b>Stück</b> für 1,80 €“ oder „100 <b>g</b> für 2,50 €“.
      </div>

      <div className="min-w-0">
        <ProductPicker
          value={value.product}
          onChange={(p) => onChange({ ...value, product: p, unit: value.unit || p?.unit || "pro Stück" })}
        />
      </div>

      {/* Hauptzeile: ab 2xl vier gleich breite Spalten */}
      <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-4">
        <div className="min-w-0">
          <FieldLabel>Menge</FieldLabel>
          <input
            inputMode="numeric"
            className="mt-1 w-full max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="0"
            value={value.qty}
            onChange={(e) => onChange({ ...value, qty: e.target.value.replace(",", ".") })}
          />
        </div>

        <div className="min-w-0">
          <FieldLabel>Set-Preis</FieldLabel>
          <div className="relative">
            <input
              className="mt-1 w-full max-w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
              placeholder="0,00"
              value={value.price}
              onChange={(e) => {
                const v = e.target.value.replace(/\./g, ",");
                if (v === "" || PRICE_RE.test(v)) onChange({ ...value, price: v });
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
          </div>
        </div>

        <div className="min-w-0">
          <FieldLabel>Mengen-Einheit</FieldLabel>
          <div className="mt-1">
            <select
              className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={value.unit || ""}
              onChange={(e) => onChange({ ...value, unit: e.target.value })}
            >
              {[...(new Set([value.unit || "", ...allUnits]))]
                .filter(Boolean)
                .map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex items-end min-w-0">
          <button
            type="button"
            className="w-full rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
            onClick={() => setCustomMode(true)}
          >
            Einheit hinzufügen
          </button>
        </div>

        {/* Custom-Einheit - vollbreit unter der Zeile */}
        {customMode && (
          <div className="lg:col-span-2 2xl:col-span-4 min-w-0">
            <div className="flex flex-col gap-2 mt-1">
              <input
                className="w-full max-w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                placeholder="z. B. Stück"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="w-full sm:flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-60"
                  disabled={!customValue.trim()}
                  onClick={() => {
                    const v = customValue.trim();
                    if (v) onChange({ ...value, unit: v });
                    setCustomValue("");
                    setCustomMode(false);
                  }}
                >
                  Übernehmen
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 active:translate-y-[1px] dark:hover:bg-zinc-800"
                  onClick={() => { setCustomValue(""); setCustomMode(false); }}
                >
                  Abbruch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <div className="min-w-0">
          <FieldLabel>Früher: Menge (optional)</FieldLabel>
          <input
            className="mt-1 w-full max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="0"
            value={value.compareQty}
            onChange={(e) => onChange({ ...value, compareQty: e.target.value.replace(",", ".") })}
          />
        </div>
        <div className="min-w-0">
          <FieldLabel>Früher: Preis (optional)</FieldLabel>
          <div className="relative">
            <input
              className="mt-1 w-full max-w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
              placeholder="0,00"
              value={value.comparePrice}
              onChange={(e) => {
                const v = e.target.value.replace(/\./g, ",");
                if (v === "" || PRICE_RE.test(v)) onChange({ ...value, comparePrice: v });
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
          </div>
        </div>
      </div>

      {!!preview && value.product && (
        <div className="text-sm mt-1">
          Neu: <b>{preview.qty}</b> {value.unit || ""} für{" "}
          <b className="tabular-nums">{euro(preview.nowCents)}</b>
          {preview.oldQty ? (
            <>
              {" "}— <span className="opacity-70">statt {preview.oldQty} {value.unit || ""}</span>
              {preview.oldCents ? <> für {euro(preview.oldCents)}</> : null}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
