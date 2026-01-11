// app/components/multibuy-form.tsx
"use client";

import { PRICE_RE, euro } from "@/app/lib/format";
import FieldLabel from "@/app/components/ui/field-label";
import ProductPicker from "@/app/components/product-picker";
import SectionCard from "@/app/components/ui/section-card";
import UnitWithCustom from "@/app/components/unit-with-custom";

export type ProductLite = { id: string; name: string; priceCents: number; unit: string };

export type MultiBuyState = {
  product: ProductLite | null;
  qty: string;
  price: string;
  compareQty: string;
  comparePrice: string;
  unit: string;
};

export default function MultiBuyForm({
  value,
  onChange,
  allUnits,
  preview,
}: {
  value: MultiBuyState;
  onChange: (next: MultiBuyState) => void;
  allUnits: string[];
  preview?: { packCents: number; qtyNum: number; cQty: number | null; cPrice: number | null } | null;
}) {
  const { product, qty, price, compareQty, comparePrice, unit } = value;

  return (
    <SectionCard>
      <div className="font-medium">Mehr für weniger</div>
      <div className="text-xs text-zinc-600 mt-1">
        „Menge <b>Einheit</b> für X €“. Beispiel: „5 <b>Stück</b> für 1,80 €“ oder „100 <b>g</b> für 2,50 €“.
      </div>

      <div className="mt-3">
        <ProductPicker
          value={product}
          onChange={(p) =>
            onChange({ ...value, product: p, unit: value.unit || p?.unit || "pro Stück" })
          }
        />
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
        <div>
          <FieldLabel>Menge</FieldLabel>
          <input
            inputMode="numeric"
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="0"
            value={qty}
            onChange={(e) => onChange({ ...value, qty: e.target.value.replace(",", ".") })}
          />
        </div>
        <div>
          <FieldLabel>Set-Preis</FieldLabel>
          <div className="relative">
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
              placeholder="0,00"
              value={price}
              onChange={(e) => {
                const v = e.target.value.replace(/\./g, ",");
                if (v === "" || PRICE_RE.test(v)) onChange({ ...value, price: v });
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">
              €
            </span>
          </div>
        </div>
        <div>
          <FieldLabel>Mengen-Einheit</FieldLabel>
          <UnitWithCustom
            value={unit}
            onChange={(v) => onChange({ ...value, unit: v })}
            allUnits={allUnits}
            placeholder="pro Stück"
          />
        </div>
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-2">
        <div>
          <FieldLabel>Früher: Menge (optional)</FieldLabel>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
            placeholder="0"
            value={compareQty}
            onChange={(e) => onChange({ ...value, compareQty: e.target.value.replace(",", ".") })}
          />
        </div>
        <div>
          <FieldLabel>Früher: Preis (optional)</FieldLabel>
          <div className="relative">
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
              placeholder="0,00"
              value={comparePrice}
              onChange={(e) => {
                const v = e.target.value.replace(/\./g, ",");
                if (v === "" || PRICE_RE.test(v)) onChange({ ...value, comparePrice: v });
              }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">
              €
            </span>
          </div>
        </div>
      </div>

      {!!preview && product && (
        <div className="text-sm mt-1">
          Neu: <b>{preview.qtyNum}</b> {unit || ""} für <b className="tabular-nums">{euro(preview.packCents)}</b>
          {preview.cQty ? (
            <>
              {" "}— <span className="opacity-70">statt {preview.cQty} {unit || ""}</span>
              {preview.cPrice ? <> für {euro(preview.cPrice)}</> : null}
            </>
          ) : null}
        </div>
      )}
    </SectionCard>
  );
}
