// app/components/offers/offers-carousel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OfferRenderer, { type OfferDTO } from "../offer-renderer";

type Context = "today" | "default";

export default function OffersCarousel({
  items,
  ariaLabel,
  context = "default",
}: {
  items: OfferDTO[];
  ariaLabel: string;
  context?: Context;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Wie viele Karten passen gerade nebeneinander (1 / 2 / 3 …)
  const [visible, setVisible] = useState(1);
  // Index der linken („führenden“) Karte im aktuellen Fenster
  const [startIndex, setStartIndex] = useState(0);
  // Maximaler Startindex (damit wir nicht „über das Ende hinaus“ scrollen)
  const [maxStart, setMaxStart] = useState(0);
  // Einheitliche Kartenhöhe (gemessen an der höchsten Karte)
  const [cardHeight, setCardHeight] = useState<number | null>(null);

  if (!items.length) return null;

  const getSlides = () => {
    const el = containerRef.current;
    if (!el) return [] as HTMLDivElement[];
    return Array.from(
      el.querySelectorAll<HTMLDivElement>("[data-offer-slide='1']")
    );
  };

  /** Breite / sichtbare Anzahl neu berechnen */
  const recalcVisible = () => {
    const el = containerRef.current;
    const slides = getSlides();
    if (!el || !slides.length) return;

    const slideWidth = slides[0].getBoundingClientRect().width;
    const containerWidth = el.getBoundingClientRect().width;
    if (!slideWidth || !containerWidth) return;

    // floor → wir überschätzen die sichtbare Anzahl nicht
    const vis = Math.max(1, Math.floor(containerWidth / slideWidth));
    const newMaxStart = Math.max(0, items.length - vis);

    setVisible(vis);
    setMaxStart(newMaxStart);
    setStartIndex((prev) => Math.min(prev, newMaxStart));
  };

  /** Kartenhöhe an höchste Karte angleichen */
  const recalcHeights = () => {
    const slides = getSlides();
    if (!slides.length) return;
    let max = 0;
    slides.forEach((slide) => {
      const card = slide.firstElementChild as HTMLElement | null;
      const h = (card || slide).getBoundingClientRect().height;
      if (h > max) max = h;
    });
    if (max > 0) setCardHeight(max);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () => {
      recalcVisible();
      recalcHeights();
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // Anzahl „Fensterpositionen“ → 1 Dot pro möglichem StartIndex
  const dotCount = maxStart + 1;

  /** Zu einer bestimmten Fensterposition scrollen (immer 1 Angebot weiter, mit Wrap) */
  const scrollToStartIndex = (target: number) => {
    const el = containerRef.current;
    const slides = getSlides();
    if (!el || !slides.length) return;

    const span = maxStart + 1; // Anzahl möglicher Startpositionen
    const normalized =
      span > 0 ? ((target % span) + span) % span : 0; // sauber im Kreis normalisieren

    const targetSlide = slides[normalized];
    if (!targetSlide) return;

    el.scrollTo({
      left: targetSlide.offsetLeft,
      behavior: "smooth",
    });
    setStartIndex(normalized);
  };

  const handleNext = () => scrollToStartIndex(startIndex + 1);
  const handlePrev = () => scrollToStartIndex(startIndex - 1);

  /** Scroll-Handler: ermittelt anhand scrollLeft, welche Karte „links“ vorne ist */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const slides = getSlides();
      if (!slides.length) return;

      const { scrollLeft } = el;
      let bestIdx = 0;
      let bestDist = Infinity;

      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.offsetLeft - scrollLeft);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });

      const clamped = Math.min(bestIdx, maxStart);
      setStartIndex(clamped);
    };

    el.addEventListener("scroll", handleScroll, { passive: true } as any);
    return () => el.removeEventListener("scroll", handleScroll as any);
  }, [maxStart]);

  return (
    <div className="relative" aria-label={ariaLabel}>
      {/* Scroll-/Swipe-Container */}
      <div
        ref={containerRef}
        className="
          flex items-stretch
          overflow-x-auto scroll-smooth
          snap-x snap-mandatory
          no-scrollbar
          px-3
        "
      >
        {items.map((item, idx) => (
          <div
            key={item.id}
            data-offer-slide="1"
            data-index={idx}
            className="
              snap-start shrink-0 grow-0 flex h-full min-w-0 p-1
              basis-[88%]
              sm:basis-[60%]
              lg:basis-[33.33%]
            "
            style={cardHeight ? { height: `${cardHeight}px` } : undefined}
          >
            <OfferRenderer item={item} context={context} />
          </div>
        ))}
      </div>

      {/* Dots + Pfeile */}
      {dotCount > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Dots: 1 Dot = 1 Fensterposition (abhängig von sichtbarer Anzahl) */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToStartIndex(i)}
                className={[
                  "h-1.5 rounded-full transition-all",
                  i === startIndex
                    ? "w-4 bg-emerald-600 dark:bg-emerald-400"
                    : "w-1.5 bg-zinc-300 dark:bg-zinc-600",
                ].join(" ")}
                aria-label={`Zu Position ${i + 1} wechseln`}
                aria-pressed={i === startIndex}
              />
            ))}
          </div>

          {/* Pfeile: immer sichtbar, scrollen GENAU 1 Angebot weiter, im Kreis */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="
                inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                bg-white/90 shadow-sm ring-1 ring-black/10
                hover:bg-emerald-50 active:scale-95
                dark:bg-zinc-900/90 dark:ring-white/15 dark:hover:bg-emerald-900/40
              "
              aria-label="Vorheriges Angebot"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="
                inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                bg-white/90 shadow-sm ring-1 ring-black/10
                hover:bg-emerald-50 active:scale-95
                dark:bg-zinc-900/90 dark:ring-white/15 dark:hover:bg-emerald-900/40
              "
              aria-label="Nächstes Angebot"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
