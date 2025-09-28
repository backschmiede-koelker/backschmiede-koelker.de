// app/components/news/use-news-feed.ts
"use client";

import { useEffect, useRef, useState } from "react";
import type { ApiNews } from "./types";

// Wie viele News laden?
const INITIAL = 6;  // initial beim ersten Laden
const STEP = 2;     // pro "Mehr laden"
const HARD_LIMIT = 50; // API-Cap laut /api/news (take <= 50)

export function useNewsFeed(baseUrl?: string) {
  const [limit, setLimit] = useState(INITIAL);
  const [items, setItems] = useState<ApiNews[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const lastCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const capped = Math.min(limit, HARD_LIMIT);
        const res = await fetch(`${baseUrl ?? ""}/api/news?active=1&limit=${capped}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiNews[] = await res.json();

        // Sicherheitshalber local nach Datum desc sortieren
        data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        if (cancelled) return;
        setItems(data);

        // Ende erkennen: weniger geliefert als angefragt ODER Länge unverändert
        const sameLength = data.length === lastCountRef.current;
        setReachedEnd(data.length < capped || sameLength);
        lastCountRef.current = data.length;
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Fehler beim Laden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [limit, baseUrl]);

  const more = () => {
    if (loading || reachedEnd) return;
    setLimit((l) => Math.min(l + STEP, HARD_LIMIT));
  };

  return { items, loading, error, more, hardLimit: HARD_LIMIT, reachedEnd };
}
