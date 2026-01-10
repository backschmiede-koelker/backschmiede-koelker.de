// app/admin/offers/components/offer-list.tsx
"use client";

import OfferCard from "@/app/components/offer-card";

type OfferDTO = import("../../../components/offer-renderer").OfferDTO; // nur Typ

export default function OfferList({
  items,
  loading,
  onReload,
}: {
  items: OfferDTO[];
  loading: boolean;
  onReload: () => void;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold">Bestehende Angebote</h2>
      <div className="text-sm text-zinc-500 min-h-[1.5rem] mt-1">{loading ? "Lade…" : null}</div>
      <ul className="mt-3 grid gap-3">
        {items.map((it) => (
          <OfferCard key={it.id} item={it} onSaved={onReload} onDeleted={onReload} />
        ))}
      </ul>
    </section>
  );
}