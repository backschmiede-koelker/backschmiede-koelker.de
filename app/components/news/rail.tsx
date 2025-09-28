// app/components/news/rail.tsx
"use client";

import React, { useEffect, useRef } from "react";

type Props = React.PropsWithChildren<{
  onKeyPrev: () => void;
  onKeyNext: () => void;
}>;

export function Rail({ children, onKeyPrev, onKeyNext }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (dir: "prev" | "next") => {
    const el = ref.current;
    if (!el) return;
    const child = el.querySelector<HTMLElement>("[data-card]");
    const gapPx = 24; // gap-6
    const delta = child ? child.offsetWidth + gapPx : el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "next" ? delta : -delta, behavior: "smooth" });
  };
  (Rail as any).scrollPrev = () => scrollByCards("prev");
  (Rail as any).scrollNext = () => scrollByCards("next");

  (Rail as any).getEl = () => ref.current;
  (Rail as any).getApproxCardWidth = () => {
    const el = ref.current;
    if (!el) return 0;
    const child = el.querySelector<HTMLElement>("[data-card]");
    return child ? child.offsetWidth : el.clientWidth;
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") onKeyNext();
    if (e.key === "ArrowLeft") onKeyPrev();
  };

  useEffect(() => {
    ref.current?.style.setProperty("overscroll-behavior-x", "contain");
  }, []);

  return (
    <div
      ref={ref}
      className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 sm:pb-3
                 px-2 sm:px-3 [scroll-padding-inline:12px]
                 [scrollbar-width:thin] [scrollbar-color:theme(colors.emerald.400)_transparent]"
      role="list"
      onKeyDown={onKey}
    >
      {children}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="h-[600px] sm:h-[660px] lg:h-[740px] overflow-hidden rounded-3xl ring-1 ring-black/5 dark:ring-white/10 bg-white/60 dark:bg-zinc-900/40">
      <div className="h-48 sm:h-60 lg:h-64 animate-pulse bg-zinc-200/70 dark:bg-zinc-800/50" />
      <div className="space-y-3 p-4 sm:p-5 lg:p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800/50" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800/50" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200/70 dark:bg-zinc-800/50" />
        <div className="h-9 w-32 animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/50" />
      </div>
    </div>
  );
}
