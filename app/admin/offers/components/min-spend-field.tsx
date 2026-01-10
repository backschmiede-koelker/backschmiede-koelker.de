// app/admin/offers/components/min-spend-field.tsx
import React from "react";
import FieldLabel from "@/app/components/ui/field-label";
import { PRICE_RE } from "@/app/lib/format";

export default function MinSpendField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="min-w-0">
        <FieldLabel hint="Nur wenn das Angebot erst ab einem bestimmten Einkaufswert gelten soll. Sonst leer lassen.">
          Ab Einkaufswert (optional)
        </FieldLabel>
        <div className="relative">
          <input
            className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 pr-10 bg-white dark:bg-zinc-800"
            placeholder="z. B. 10,00"
            value={value}
            onChange={(e) => {
              const v = e.target.value.replace(/\./g, ",");
              if (v === "" || PRICE_RE.test(v)) onChange(v);
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-zinc-500">€</span>
        </div>
      </div>
    </div>
  );
}
