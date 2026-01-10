// app/admin/offers/hooks/use-offers.ts
"use client";

import { useCallback, useEffect, useState } from "react";

type OfferDTO = import("../../../components/offer-renderer").OfferDTO;

export function useOffers() {
  const [items, setItems] = useState<OfferDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/offers?type=all&limit=1000", { cache: "no-store" });
      const j = await res.json();
      setItems(j.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, reload };
}
