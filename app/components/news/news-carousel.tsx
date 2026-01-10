"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiNews } from "./types";
import { NewsCard } from "./news-card";
import { EmptyState } from "./empty-state";
import { LoadMoreCard } from "./load-more-card";

type Props = {
  items: ApiNews[] | null;
  loading: boolean;
  error: string | null;
  reachedEnd: boolean;
  countLabel: string;
  onLoadMore: () => void;
};

export default function NewsCarousel({
  items,
  loading,
  error,
  reachedEnd,
  countLabel,
  onLoadMore,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [startIndex, setStartIndex] = useState(0);
  const [maxStart, setMaxStart] = useState(0);

  // Refs gegen stale state + weniger Renders
  const startIndexRef = useRef(0);
  const maxStartRef = useRef(0);

  // Statt nur "slide offsets" -> echte Scroll-Positionen (inkl. letzter = maxScrollLeft)
  const positionsRef = useRef<number[]>([]);

  const rafScrollRef = useRef<number | null>(null);

  // "Mehr laden" Boundary-Fix (neue Items rechts, Position bleibt)
  const prevMaxLeftRef = useRef<number | null>(null);
  const prevLenRef = useRef<number>(0);

  const slideCount = useMemo(() => {
    if (error) return 1;
    if (items === null) return 2; // Skeletons
    // Items geladen -> immer +1 für "Mehr laden" Card
    return Math.max(1, items.length) + 1; // empty-state zählt als 1
  }, [items, error]);

  const getSlides = () => {
    const el = containerRef.current;
    if (!el) return [] as HTMLDivElement[];
    return Array.from(
      el.querySelectorAll<HTMLDivElement>("[data-news-slide='1']")
    );
  };

  const uniqSorted = (arr: number[]) => {
    const out: number[] = [];
    const sorted = [...arr].sort((a, b) => a - b);
    for (const v of sorted) {
      if (!out.length || Math.abs(out[out.length - 1] - v) > 1) out.push(v);
    }
    return out;
  };

  const recalcLayout = () => {
    const el = containerRef.current;
    if (!el) return;

    const slides = getSlides();
    if (!slides.length) return;

    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);

    // Alle snap-start Offsets, die wirklich erreichbar sind
    const offsets = slides.map((s) => s.offsetLeft);
    const reachable = offsets.filter((o) => o <= maxScrollLeft + 2);

    // Positionen:
    // - alle erreichbaren snap-starts
    // - PLUS ein finaler "Ende"-Punkt = maxScrollLeft (rechts bündig)
    let positions = uniqSorted(reachable);
    if (!positions.length) positions = [0];

    const last = positions[positions.length - 1] ?? 0;
    if (maxScrollLeft > last + 2) {
      positions.push(maxScrollLeft);
    } else {
      // falls nahezu gleich, ersetzen wir den letzten durch maxScrollLeft
      positions[positions.length - 1] = maxScrollLeft;
    }

    positionsRef.current = positions;

    const newMaxStart = Math.max(0, positions.length - 1);
    maxStartRef.current = newMaxStart;
    setMaxStart(newMaxStart);

    if (startIndexRef.current > newMaxStart) {
      startIndexRef.current = newMaxStart;
      setStartIndex(newMaxStart);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // nach Render + nach Layout
    requestAnimationFrame(() => requestAnimationFrame(recalcLayout));

    const onResize = () => recalcLayout();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideCount]);

  // Scroll Handler: rAF-throttled + Binary Search auf positionsRef
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (rafScrollRef.current) return;

      rafScrollRef.current = requestAnimationFrame(() => {
        rafScrollRef.current = null;

        const positions = positionsRef.current;
        if (!positions.length) return;

        const x = el.scrollLeft;

        // Binary search: erster pos >= x
        let lo = 0;
        let hi = positions.length - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (positions[mid] < x) lo = mid + 1;
          else hi = mid;
        }

        let idx = lo;
        if (
          idx > 0 &&
          Math.abs(positions[idx - 1] - x) < Math.abs(positions[idx] - x)
        ) {
          idx = idx - 1;
        }

        const clamped = Math.min(idx, maxStartRef.current);

        if (clamped !== startIndexRef.current) {
          startIndexRef.current = clamped;
          setStartIndex(clamped);
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true } as any);
    return () => {
      el.removeEventListener("scroll", onScroll as any);
      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
      rafScrollRef.current = null;
    };
  }, []);

  const dotCount = maxStart + 1;

  const scrollToStartIndex = (target: number) => {
    const el = containerRef.current;
    if (!el) return;

    const positions = positionsRef.current;
    if (!positions.length) return;

    const span = positions.length;
    const normalized = span > 0 ? ((target % span) + span) % span : 0;

    const left = positions[normalized] ?? 0;
    el.scrollTo({ left, behavior: "smooth" });

    startIndexRef.current = normalized;
    setStartIndex(normalized);
  };

  const handleNext = () => scrollToStartIndex(startIndexRef.current + 1);
  const handlePrev = () => scrollToStartIndex(startIndexRef.current - 1);

  const backToStart = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "smooth" });
    startIndexRef.current = 0;
    setStartIndex(0);
  };

  const loadMoreStayAtBoundary = () => {
    const el = containerRef.current;
    if (el) {
      // wir merken uns das alte Ende (rechts bündig)
      prevMaxLeftRef.current = Math.max(0, el.scrollWidth - el.clientWidth);
    } else {
      prevMaxLeftRef.current = null;
    }
    onLoadMore();
  };

  // Wenn items wachsen: an den gemerkten Übergang zurück (neue Items rechts)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const len = items?.length ?? 0;
    const grew = len > prevLenRef.current;

    if (grew && prevMaxLeftRef.current !== null) {
      requestAnimationFrame(() => {
        el.scrollTo({ left: prevMaxLeftRef.current!, behavior: "auto" });
        prevMaxLeftRef.current = null;
        recalcLayout();
      });
    }

    prevLenRef.current = len;
  }, [items?.length]);

  const slideClass =
    "snap-start shrink-0 grow-0 flex h-full min-w-0 p-1 " +
    "basis-[88%] sm:basis-[60%] md:basis-[50%]";

  return (
    <div className="relative min-w-0" aria-label="News Carousel">
      <div
        ref={containerRef}
        className="
          flex items-stretch
          overflow-x-auto
          snap-x snap-mandatory
          no-scrollbar
          px-2 sm:px-3
          min-w-0
        "
        role="list"
        aria-label="Aktuelles"
      >
        {/* ERROR */}
        {error && (
          <div data-news-slide="1" className={slideClass}>
            <div className="w-full rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 text-sm text-red-700 shadow-sm dark:bg-zinc-900/70 dark:ring-white/10 dark:text-red-300">
              Fehler beim Laden: {error}
            </div>
          </div>
        )}

        {/* SKELETONS */}
        {!error && items === null && (
          <>
            <div data-news-slide="1" className={slideClass}>
              <SkeletonNewsCard />
            </div>
            <div data-news-slide="1" className={slideClass}>
              <SkeletonNewsCard />
            </div>
          </>
        )}

        {/* EMPTY */}
        {!error && items !== null && items.length === 0 && !loading && (
          <div data-news-slide="1" className={slideClass}>
            <EmptyState />
          </div>
        )}

        {/* NEWS */}
        {!error && items?.length ? (
          items.map((n) => (
            <div key={n.id} data-news-slide="1" className={slideClass}>
              <NewsCard n={n} />
            </div>
          ))
        ) : null}

        {/* LOAD MORE: immer letzte Karte sobald items != null */}
        {!error && items !== null && (
          <div data-news-slide="1" className={slideClass}>
            <LoadMoreCard
              onClick={loadMoreStayAtBoundary}
              loading={loading}
              reachedEnd={reachedEnd}
              onBackToStart={backToStart}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      {dotCount > 1 ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="text-xs text-zinc-600 dark:text-zinc-400"
            aria-live="polite"
          >
            {loading ? "Lade …" : countLabel}
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: dotCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToStartIndex(i)}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    i === startIndex
                      ? "w-4 bg-amber-600 dark:bg-amber-400"
                      : "w-1.5 bg-zinc-300 dark:bg-zinc-600",
                  ].join(" ")}
                  aria-label={`Zu Position ${i + 1} wechseln`}
                  aria-pressed={i === startIndex}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="
                  inline-flex h-8 w-8 items-center justify-center rounded-full
                  bg-white shadow-sm ring-1 ring-black/10
                  hover:bg-amber-100 active:scale-95
                  dark:bg-zinc-900/90 dark:ring-white/15 dark:hover:bg-amber-900/25
                "
                aria-label="Vorherige News"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="
                  inline-flex h-8 w-8 items-center justify-center rounded-full
                  bg-white shadow-sm ring-1 ring-black/10
                  hover:bg-amber-100 active:scale-95
                  dark:bg-zinc-900/90 dark:ring-white/15 dark:hover:bg-amber-900/25
                "
                aria-label="Nächste News"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="mt-3 text-xs text-zinc-600 dark:text-zinc-400"
          aria-live="polite"
        >
          {loading ? "Lade …" : countLabel}
        </div>
      )}
    </div>
  );
}

function SkeletonNewsCard() {
  return (
    <div className="h-[520px] sm:h-[560px] w-full overflow-hidden rounded-2xl ring-1 ring-black/5 bg-white/60 dark:bg-zinc-900/40 dark:ring-white/10">
      <div className="h-44 sm:h-48 animate-pulse bg-zinc-200/70 dark:bg-zinc-800/50" />
      <div className="space-y-3 p-3.5 sm:p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800/50" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800/50" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800/50" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800/50" />
        <div className="h-9 w-32 animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/50" />
      </div>
    </div>
  );
}
