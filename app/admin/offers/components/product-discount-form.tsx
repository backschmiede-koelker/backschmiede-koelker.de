// app/admin/offers/product-discount-form.tsx
import React from "react";
import FieldLabel from "@/app/components/ui/field-label";
import ProductPicker from "@/app/components/product-picker";
import UnitSelector from "@/app/components/ui/unit-selector";
import { PRICE_RE, euro, centsToEuroString } from "@/app/lib/format";

type ProductLite = { id: string; name: string; priceCents: number; unit: string };

type State = { product: ProductLite | null; price: string; original: string; unit: string };

export default function ProductDiscountForm({
  value,
  onChange,
  allUnits,
  preview,
}: {
  value: State;
  onChange: (v: State) => void;
  allUnits: string[];
  preview: null | { old: number | null; now: number };
}) {
  return (
    <div className="rounded-xl border p-3 grid gap-3">
      <div className="font-medium">Produkt reduziert</div>
      <div className="text-xs text-zinc-600">Neuen Preis eintragen, optional „Statt“-Preis.</div>

      <div className="min-w-0">
        <ProductPicker
          value={value.product}
          onChange={(p) =>
            onChange({
              ...value,
              product: p,
              unit: value.unit || p?.unit || "pro Stück",
              original: p ? centsToEuroString(p.priceCents) : value.original,
            })
          }
        />
      </div>

      {/* Responsive Grid:
          - default: 1 Spalte
          - ab lg: 2 Spalten (Einheit nimmt eine EIGENE ZEILE: col-span-2)
          - ab 2xl: 3 Spalten (Einheit ist eine EIGENE SPALTE)
      */}
      <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
        <div className="min-w-0">
          <FieldLabel>Neuer Preis</FieldLabel>
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
          <FieldLabel>Statt-Preis (optional)</FieldLabel>
          <div className="relative">
            <input
              className="mt-1 w-full max-w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
              placeholder="0,00"
              value={value.original}
              onChange={(e) => {
                const v = e.target.value.replace(/\./g, ",");
                if (v === "" || PRICE_RE.test(v)) onChange({ ...value, original: v });
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
          </div>
        </div>

        <div className="lg:col-span-2 2xl:col-span-1 min-w-0">
          <FieldLabel>Einheit (optional)</FieldLabel>
          <UnitSelector
            className="mt-1 w-full"
            value={value.unit}
            onChange={(u) => onChange({ ...value, unit: u })}
            allUnits={allUnits}
            placeholder="pro Stück"
            addLabel="Einheit hinzufügen"
            customPlaceholder="z. B. 250 g"
          />
        </div>
      </div>

      {!!preview && value.product && (
        <div className="text-sm mt-1">
          Vorher:{" "}
          {preview.old != null ? (
            <span className="tabular-nums line-through opacity-70">{euro(preview.old)}</span>
          ) : (
            <i>—</i>
          )}{" "}
          → Neu: <span className="tabular-nums font-semibold">{euro(preview.now)}</span>
          {value.unit ? <> / {value.unit}</> : null}
        </div>
      )}
    </div>
  );
}
