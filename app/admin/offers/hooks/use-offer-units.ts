// app/admin/offers/hooks/use-offer-units.ts
"use client";

import { useEffect, useState } from "react";

export function useOfferUnits() {
  const [allUnits, setAllUnits] = useState<string[]>(["pro Stück"]);

  useEffect(() => {
    let alive = true;
    function parseProductsJson(json: any) {
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.items)) return json.items;
      return [];
    }
    (async () => {
      try {
        const res = await fetch("/api/products?limit=50", { cache: "no-store" });
        const json = await res.json();
        const products = parseProductsJson(json);
        const units = new Set<string>(["pro Stück"]);
        products.forEach((p: any) => {
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