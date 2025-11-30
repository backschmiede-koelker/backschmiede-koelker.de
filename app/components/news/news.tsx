// app/components/news/news.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useNewsFeed } from "./use-news-feed";
import { NewsCard } from "./news-card";
import { SkeletonCard } from "./rail";
import { EmptyState } from "./empty-state";
import { Rail } from "./rail";
import { Controls } from "./controls";
import { LoadMoreCard } from "./load-more-card";
import { EndOfFeedCard } from "./end-of-feed-card";

export default function News() {
  const { items, loading, error, more, reachedEnd, hardLimit } =
    useNewsFeed(process.env.NEXT_PUBLIC_BASE_URL ?? "");

  const countLabel = useMemo(() => {
    if (error) return `Fehler: ${error}`;
    if (loading && !items) return "Lade …";
    if (!items) return "Lade …";

    const noun = items.length === 1 ? "Eintrag" : "Einträge";

    return `${items.length} ${noun}${
      reachedEnd || items.length >= hardLimit ? " (Ende)" : ""
    }`;
  }, [items, loading, error, reachedEnd, hardLimit]);

  const scrollPrev = () => (Rail as any).scrollPrev?.();
  const scrollNext = () => (Rail as any).scrollNext?.();

  const backToStart = () =>
    document.querySelector<HTMLElement>('[role="list"]')?.scrollTo({ left: 0, behavior: "smooth" });

  // --- Neuer "Mehr laden" Flow: Nachladen ohne ans GANZ rechte Ende zu springen ---
  // Wir wollen nach dem Append am Übergang bleiben (alte letzte Karte am rechten Rand).
  const prevMaxLeftRef = useRef<number | null>(null);
  const prevLenRef = useRef<number>(0);

  const loadMoreStayAtBoundary = () => {
    const el = (Rail as any).getEl?.() as HTMLDivElement | null;
    if (el) {
      // Maximalen alten ScrollLeft merken (Übergang)
      prevMaxLeftRef.current = Math.max(0, el.scrollWidth - el.clientWidth);
    } else {
      prevMaxLeftRef.current = null;
    }
    more();
  };

  // Wenn Länge gewachsen ist, an den gemerkten Übergang scrollen
  useEffect(() => {
    const el = (Rail as any).getEl?.() as HTMLDivElement | null;
    if (!el) return;
    const len = items?.length ?? 0;
    const grew = len > prevLenRef.current;

    if (grew && prevMaxLeftRef.current !== null) {
      // Warten bis DOM gerendert ist
      requestAnimationFrame(() => {
        el.scrollTo({ left: prevMaxLeftRef.current!, behavior: "auto" });
        prevMaxLeftRef.current = null; // reset
      });
    }

    prevLenRef.current = len;
  }, [items?.length]);

  return (
    <section aria-label="Neuigkeiten" className="relative">
      <Rail onKeyPrev={scrollPrev} onKeyNext={scrollNext}>
        {items?.length
          ? items.map((n) => (
              <div
                key={n.id}
                data-card
                role="listitem"
                className="min-w-0 snap-start shrink-0 basis-full lg:basis-[calc(50%-12px)]"
              >
                <NewsCard n={n} />
              </div>
            ))
          : null}

        {!items && (
          <>
            <div className="min-w-0 snap-start shrink-0 basis-full lg:basis-[calc(50%-12px)]"><SkeletonCard /></div>
            <div className="min-w-0 snap-start shrink-0 basis-full lg:basis-[calc(50%-12px)]"><SkeletonCard /></div>
          </>
        )}

        {items?.length === 0 && !loading && !error && <EmptyState />}

        {items && (
          <div className="min-w-0 snap-start shrink-0 basis-full lg:basis-[calc(50%-12px)]">
            {reachedEnd ? (
              <EndOfFeedCard onBackToStart={backToStart} />
            ) : (
              <LoadMoreCard onClick={loadMoreStayAtBoundary} loading={loading} />
            )}
          </div>
        )}
      </Rail>

      <Controls onPrev={scrollPrev} onNext={scrollNext} loading={!!loading} countLabel={countLabel} />
    </section>
  );
}
