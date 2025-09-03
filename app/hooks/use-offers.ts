"use client";
import { useCallback, useEffect, useState } from "react";
import { Offer, Location, OfferKind, Weekday } from "@prisma/client";

export function useOffers() {
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/offers?type=all", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function remove(id: string) {
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    await reload();
  }

  return { items, loading, reload, remove };
}
