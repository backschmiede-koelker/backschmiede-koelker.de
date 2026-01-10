// app/admin/offers/product-new-form.tsx
import React from "react";
import FieldLabel from "@/app/components/ui/field-label";
import ProductPicker from "@/app/components/product-picker";

type ProductLite = { id: string; name: string; priceCents: number; unit: string };
type State = { product: ProductLite | null; label: string };

export default function ProductNewForm({
  value,
  onChange,
}: {
  value: State;
  onChange: (v: State) => void;
}) {
  return (
    <div className="rounded-xl border p-3 grid gap-3">
      <div className="font-medium">Jetzt neu</div>
      <div className="text-xs text-zinc-600">
        Wähle das neue Produkt aus und gib bei Bedarf ein kurzes Label ein.
      </div>

      <div className="min-w-0">
        <ProductPicker
          value={value.product}
          onChange={(p) => onChange({ ...value, product: p })}
        />
      </div>

      <div className="min-w-0">
        <FieldLabel>Label</FieldLabel>
        <input
          className="mt-1 w-full max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
      </div>
    </div>
  );
}
