// app/admin/offers/hooks/use-offer-units.ts
"use client";

import { useEffect, useState } from "react";

export function useOfferUnits() {
  const [allUnits, setAllUnits] = useState<string[]>(["pro Stück"]);

  useEffect(() => {
    let alive = true;
    type ProductLike = { unit?: string | null };
    function parseProductsJson(json: unknown): ProductLike[] {
      if (Array.isArray(json)) return json as ProductLike[];
      if (json && typeof json === "object" && Array.isArray((json as { items?: unknown }).items)) {
        return (json as { items: ProductLike[] }).items;
      }
      return [];
    }
    (async () => {
      try {
        const res = await fetch("/api/products?limit=50", { cache: "no-store" });
        const json = (await res.json()) as unknown;
        const products = parseProductsJson(json);
        const units = new Set<string>(["pro Stück"]);
        products.forEach((p) => {
          const u = (p?.unit || "").trim();
          if (u) units.add(u);
        });
        if (alive) setAllUnits(Array.from(units).sort((a, b) => a.localeCompare(b, "de")));
      } catch {
        if (alive) setAllUnits(["pro Stück"]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return allUnits;
}
