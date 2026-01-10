// app/admin/offers/components/offer-type-selector.tsx
import React from "react";
import { OfferType } from "@/app/types/offers";

const TYPES: { key: OfferType; title: string; hint: string }[] = [
  {
    key: OfferType.GENERIC,
    title: "Allgemein",
    hint: "Hinweis, Aktion, Platzhalter",
  },
  {
    key: OfferType.PRODUCT_NEW,
    title: "Jetzt neu",
    hint: "Neues Produkt zeigen",
  },
  {
    key: OfferType.PRODUCT_DISCOUNT,
    title: "Produkt reduziert",
    hint: "Neuer Preis (optional statt)",
  },
  {
    key: OfferType.MULTIBUY_PRICE,
    title: "Mehr für weniger",
    hint: "z. B. 5 Stück für 1,80 €",
  },
];

export default function OfferTypeSelector({
  type,
  onChange,
}: {
  type: OfferType;
  onChange: (t: OfferType) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {TYPES.map((c) => {
        const active = type === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            aria-pressed={active}
            className={[
              "w-full min-w-0 rounded-xl p-3 text-left ring-1 transition",
              active
                ? "bg-amber-50 ring-amber-300 dark:bg-amber-900/20 dark:ring-amber-700"
                : "bg-white ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:bg-zinc-800/80",
            ].join(" ")}
          >
            <div className="font-medium truncate">{c.title}</div>
            <div className="text-xs opacity-80 truncate">{c.hint}</div>
          </button>
        );
      })}
    </div>
  );
}
