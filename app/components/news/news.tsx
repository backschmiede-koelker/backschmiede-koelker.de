// app/components/news/news.tsx
"use client";

import { useMemo } from "react";
import { useNewsFeed } from "./use-news-feed";
import NewsCarousel from "./news-carousel";

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

  return (
    <section aria-label="Neuigkeiten" className="relative min-w-0">
      <NewsCarousel
        items={items}
        loading={!!loading}
        error={error}
        reachedEnd={reachedEnd}
        countLabel={countLabel}
        onLoadMore={more}
      />
    </section>
  );
}
