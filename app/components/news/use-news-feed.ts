"use client";

import { useEffect, useRef, useState } from "react";
import type { ApiNews } from "./types";

/**
 * PERFORMANCE-TUNING:
 * - NEWS_INITIAL: wie viele News initial geladen werden
 * - NEWS_STEP: wie viele pro Klick auf "Mehr laden" nachgeladen werden
 */
export const NEWS_INITIAL = 4;
export const NEWS_STEP = 2;

const HARD_LIMIT = 50; // API-Cap laut /api/news (take <= 50)

export function useNewsFeed(baseUrl?: string) {
  const [limit, setLimit] = useState(NEWS_INITIAL);
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

        const res = await fetch(
          `${baseUrl ?? ""}/api/news?active=1&limit=${capped}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ApiNews[] = await res.json();

        // Sicherheitshalber local nach Datum desc sortieren
        data.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        if (cancelled) return;

        setItems(data);

        // Ende erkennen:
        // - weniger geliefert als angefragt
        // - ODER Länge unverändert (kein Zuwachs, obwohl Limit hochgegangen ist)
        const sameLength = data.length === lastCountRef.current;
        setReachedEnd(data.length < capped || sameLength || data.length >= HARD_LIMIT);

        lastCountRef.current = data.length;
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Fehler beim Laden.");
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
    setLimit((l) => Math.min(l + NEWS_STEP, HARD_LIMIT));
  };

  return { items, loading, error, more, hardLimit: HARD_LIMIT, reachedEnd };
}
