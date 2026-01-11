// app/components/events/events-timeline.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { EventItem } from "@/app/types/event";
import { fmtDate } from "@/app/lib/time";
import { FaCalendarDays } from "react-icons/fa6";
import { ChevronLeft, ChevronRight, MoreHorizontal, X } from "lucide-react";

/**
 * Schnell anpassbar:
 * - INITIAL_FUTURE_COUNT: initial sichtbar ab "jetzt" (nur Zukunft)
 * - INITIAL_PAST_COUNT: initial sichtbar aus Vergangenheit (standard 0)
 * - LOAD_MORE_*: pro Klick nachladen
 *
 * Intern: wir fetchen jeweils +1 Item zum "peek", damit hasMore* sauber ist.
 */
const INITIAL_FUTURE_COUNT = 4;
const INITIAL_PAST_COUNT = 0;

const LOAD_MORE_FUTURE_COUNT = 4;
const LOAD_MORE_PAST_COUNT = 4;

const PEEK_PAST_COUNT = 1;
const PEEK_FUTURE_EXTRA = 0;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function uniqById(items: EventItem[]) {
  const map = new Map<string, EventItem>();
  for (const it of items) map.set(it.id, it);
  return Array.from(map.values());
}

function sortByStartsAsc(items: EventItem[]) {
  return [...items].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
}

function dateLabel(iso: string) {
  return fmtDate(iso, { day: "2-digit", month: "short", year: "numeric" });
}

function timeLabel(iso: string) {
  return fmtDate(iso, { hour: "2-digit", minute: "2-digit" });
}

function locationLabels(locs?: ("RECKE" | "METTINGEN")[]) {
  if (!locs?.length) return [];
  const map = { RECKE: "Recke", METTINGEN: "Mettingen" } as const;
  return locs.map((l) => map[l] ?? l);
}

function sameDay(aIso: string, bIso: string) {
  const a = new Date(aIso);
  const b = new Date(bIso);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timeRange(startsAt: string, endsAt?: string | null) {
  const startT = timeLabel(startsAt);
  if (!endsAt) return startT;

  if (sameDay(startsAt, endsAt)) return `${startT}-${timeLabel(endsAt)}`;
  return `${startT} bis ${dateLabel(endsAt)} ${timeLabel(endsAt)}`;
}

function PlaceholderPanel({
  startsAt,
  endsAt,
}: {
  startsAt: string;
  endsAt?: string | null;
}) {
  return (
    <div
      className={[
        "relative w-full h-full overflow-hidden",
        "bg-gradient-to-br from-emerald-200/80 via-white to-orange-300/45",
        "dark:from-emerald-900/35 dark:via-zinc-900 dark:to-orange-900/30",
      ].join(" ")}
    >
      <div className="absolute inset-0 opacity-45 dark:opacity-35">
        <div className="absolute -top-10 -left-10 h-28 w-28 rounded-full bg-emerald-300/55 blur-[28px] dark:bg-emerald-500/20" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-orange-400/40 blur-[30px] dark:bg-orange-500/15" />
      </div>

      <div className="relative z-10 flex h-full items-start justify-start p-3">
        <div className="flex items-start gap-2">
          <div className="rounded-xl bg-white/80 p-2 ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/10">
            <FaCalendarDays className="text-emerald-900 dark:text-emerald-100" />
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
              {dateLabel(startsAt)}
            </div>
            <div className="text-[12px] text-zinc-800/90 dark:text-zinc-300">
              {timeRange(startsAt, endsAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopRoundButton({
  variant,
  side,
  onClick,
  loading,
  show,
}: {
  variant: "scroll" | "load";
  side: "left" | "right";
  onClick: () => void;
  loading?: boolean;
  show: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  const aria =
    variant === "load"
      ? `Mehr laden (${side === "left" ? "Vergangenheit" : "Zukunft"})`
      : side === "left"
        ? "Nach links scrollen"
        : "Nach rechts scrollen";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      title={aria}
      className={[
        "pointer-events-auto",
        "h-10 w-10 rounded-full grid place-items-center",
        "bg-white ring-1 ring-black/20 shadow-sm",
        "hover:bg-zinc-100 hover:ring-black/30 hover:shadow-md",
        "active:scale-[0.98] transition",
        "dark:bg-zinc-900 dark:ring-white/20",
        "dark:hover:bg-zinc-800 dark:hover:ring-white/30 dark:hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60",
        show ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {variant === "load" ? (
        <MoreHorizontal className="h-5 w-5" />
      ) : (
        <Icon className="h-5 w-5" />
      )}
      {loading ? <span className="sr-only">Lade…</span> : null}
    </button>
  );
}

function MobileEdgeLoadButton({
  side,
  onClick,
  loading,
}: {
  side: "left" | "right";
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <div
      className={[
        "md:hidden pointer-events-auto",
        "absolute top-1/2 -translate-y-1/2 z-20",
        side === "left" ? "left-2" : "right-2",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={[
          "rounded-full px-3 py-2 text-xs font-semibold",
          "bg-white ring-1 ring-black/20 shadow-sm",
          "hover:bg-zinc-100 hover:ring-black/30 hover:shadow-md",
          "dark:bg-zinc-900 dark:ring-white/20 dark:hover:bg-zinc-800 dark:hover:ring-white/30 dark:hover:shadow-md",
          "disabled:opacity-70",
          "active:scale-[0.98] transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60",
        ].join(" ")}
      >
        {loading ? "Lade…" : "Mehr laden"}
      </button>
    </div>
  );
}

/**
 * Beschreibung:
 * - 2 Zeilen müssen IMMER ohne Scrollbar passen
 * - ab der 3. Zeile: Scrollbar (nur dann)
 *
 * Fix für "manchmal passen 2 Zeilen nicht":
 * - Wir garantieren die 2-Zeilen-Höhe durch feste Typografie (text-sm + leading-5)
 * - Und wir stellen sicher, dass das Bild automatisch schrumpft, damit dieser Block immer Platz bekommt
 */
function DescriptionBox({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      // kleine Toleranz gegen Subpixel
      const needs = el.scrollHeight > el.clientHeight + 2;
      setScrollable(needs);
    };

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div
      ref={ref}
      className={[
        "mt-1.5 text-sm text-zinc-800 dark:text-zinc-300 break-words",
        // ✅ exakt 2 Zeilen sichtbar: text-sm + leading-5 => 2 * 1.25rem = 2.5rem
        "leading-5 h-10",
        scrollable ? "overflow-y-auto pr-1" : "overflow-hidden",
        "min-h-0",
        scrollable
          ? "[scrollbar-width:thin] [scrollbar-color:rgba(16,185,129,0.45)_transparent] dark:[scrollbar-color:rgba(52,211,153,0.35)_transparent]"
          : "",
      ].join(" ")}
    >
      {text}
    </div>
  );
}

export default function EventsTimeline() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const stepRef = useRef<number>(260);

  // above = ((idx + parityOffset) % 2 === 0)
  const [parityOffset, setParityOffset] = useState<0 | 1>(0);

  const [items, setItems] = useState<EventItem[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [loadingPast, setLoadingPast] = useState(false);
  const [loadingFuture, setLoadingFuture] = useState(false);

  const [hasMorePast, setHasMorePast] = useState(false);
  const [hasMoreFuture, setHasMoreFuture] = useState(false);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const [rootH, setRootH] = useState<number>(600);

  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null
  );

  function updateScrollButtons() {
    const el = scrollerRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max - 2);
  }

  function scrollByOneCard(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(180, stepRef.current || 260);
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  function getLeftAnchorId(): string | null {
    const el = scrollerRef.current;
    if (!el) return null;

    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-event-id]"));
    if (!cards.length) return null;

    const left = el.scrollLeft;
    let best: { id: string; score: number } | null = null;

    for (const c of cards) {
      const id = c.dataset.eventId;
      if (!id) continue;
      const center = c.offsetLeft + c.offsetWidth / 2;
      const score = Math.abs(center - (left + 1));
      if (!best || score < best.score) best = { id, score };
    }
    return best?.id ?? null;
  }

  async function fetchRange(params: {
    range: "past" | "future";
    take: number;
    cursor?: string | null;
  }) {
    const takePlus = params.take + 1;

    const sp = new URLSearchParams();
    sp.set("active", "1");
    sp.set("range", params.range);
    sp.set("take", String(takePlus));
    if (params.cursor) sp.set("cursor", params.cursor);

    const res = await fetch(`/api/events?${sp.toString()}`, { cache: "no-store" });
    const data: EventItem[] = await res.json();
    const list = Array.isArray(data) ? data : [];

    return {
      items: list.slice(0, params.take),
      hasMore: list.length > params.take,
    };
  }

  function minStartIso(list: EventItem[]) {
    if (!list.length) return null;
    const min = list.reduce(
      (m, e) => (new Date(e.startsAt) < new Date(m.startsAt) ? e : m),
      list[0]
    );
    return min.startsAt;
  }

  function maxStartIso(list: EventItem[]) {
    if (!list.length) return null;
    const max = list.reduce(
      (m, e) => (new Date(e.startsAt) > new Date(m.startsAt) ? e : m),
      list[0]
    );
    return max.startsAt;
  }

  async function loadPast(count: number) {
    if (loadingPast || !hasMorePast) return;

    const anchorId = getLeftAnchorId();
    const anchorIdxBefore = anchorId ? items.findIndex((x) => x.id === anchorId) : -1;
    const anchorWasAbove =
      anchorIdxBefore >= 0 ? ((anchorIdxBefore + parityOffset) % 2 === 0) : true;

    setLoadingPast(true);
    try {
      const cursor = minStartIso(items) ?? new Date().toISOString();
      const { items: pastDesc, hasMore } = await fetchRange({
        range: "past",
        take: count,
        cursor,
      });

      const pastAsc = [...pastDesc].reverse();
      const merged = sortByStartsAsc(uniqById([...pastAsc, ...items]));
      setItems(merged);
      setHasMorePast(hasMore);

      // ✅ Anchor oben/unten bleibt stabil
      if (anchorId) {
        const anchorIdxAfter = merged.findIndex((x) => x.id === anchorId);
        if (anchorIdxAfter >= 0) {
          const shouldBeAbove = anchorWasAbove;
          const currentAboveIfOffset0 = anchorIdxAfter % 2 === 0;
          const newOffset: 0 | 1 = currentAboveIfOffset0 === shouldBeAbove ? 0 : 1;
          setParityOffset(newOffset);
        }
      }

      requestAnimationFrame(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const added = pastAsc.length;
        el.scrollLeft += added * stepRef.current;
        updateScrollButtons();
      });
    } finally {
      setLoadingPast(false);
    }
  }

  async function loadFuture(count: number) {
    if (loadingFuture || !hasMoreFuture) return;

    setLoadingFuture(true);
    try {
      const cursor = maxStartIso(items) ?? new Date().toISOString();
      const { items: futureAsc, hasMore } = await fetchRange({
        range: "future",
        take: count,
        cursor,
      });

      const merged = sortByStartsAsc(uniqById([...items, ...futureAsc]));
      setItems(merged);
      setHasMoreFuture(hasMore);

      requestAnimationFrame(() => updateScrollButtons());
    } finally {
      setLoadingFuture(false);
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingInit(true);
      try {
        const { items: future, hasMore } = await fetchRange({
          range: "future",
          take: INITIAL_FUTURE_COUNT + PEEK_FUTURE_EXTRA,
        });
        if (!alive) return;

        setItems(sortByStartsAsc(uniqById([...future])));
        setHasMoreFuture(hasMore || future.length >= INITIAL_FUTURE_COUNT);

        if (INITIAL_PAST_COUNT > 0) {
          const cursor = minStartIso(future) ?? new Date().toISOString();
          const { items: pastDesc, hasMore: morePast } = await fetchRange({
            range: "past",
            take: INITIAL_PAST_COUNT,
            cursor,
          });
          if (!alive) return;

          const pastAsc = [...pastDesc].reverse();
          setItems(sortByStartsAsc(uniqById([...pastAsc, ...future])));
          setHasMorePast(morePast);
        } else {
          const sp = new URLSearchParams();
          sp.set("active", "1");
          sp.set("range", "past");
          sp.set("take", String(PEEK_PAST_COUNT));
          sp.set("cursor", new Date().toISOString());
          const res = await fetch(`/api/events?${sp.toString()}`, { cache: "no-store" });
          const data: EventItem[] = await res.json();
          const list = Array.isArray(data) ? data : [];
          if (!alive) return;
          setHasMorePast(list.length > 0);
        }
      } finally {
        if (!alive) return;
        setLoadingInit(false);
        requestAnimationFrame(() => {
          const el = scrollerRef.current;
          if (el) el.scrollLeft = 0;
          updateScrollButtons();
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateScrollButtons();

    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => updateScrollButtons());
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const h = el.getBoundingClientRect().height;
      if (h && Number.isFinite(h)) setRootH(Math.max(320, Math.round(h)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const sc = scrollerRef.current;
    if (!sc) return;
    const first = sc.querySelector<HTMLElement>("[data-event-card='1']");
    const next = sc.querySelector<HTMLElement>("[data-event-card='2']");
    if (first && next) {
      const a = first.getBoundingClientRect();
      const b = next.getBoundingClientRect();
      const step = Math.round(Math.abs(b.left - a.left));
      if (step > 150) stepRef.current = step;
    } else {
      stepRef.current = 260;
    }
  }, [items.length]);

  useEffect(() => {
    if (!lightbox) return;

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const empty = !loadingInit && items.length === 0;
  const renderList = useMemo(() => items, [items]);

  // ====== LAYOUT: hier ist der Fix ======
  // Wir reservieren die Text-Fläche so, dass:
  // - Titel (notfalls nur 1 Zeile)
  // - Start + Ende
  // - 2 Zeilen Beschreibung (h-10, leading-5)
  // IMMER reinpassen. Bild schrumpft stattdessen.
  const gapToLine = 18; // etwas kleiner => mehr nutzbare Höhe
  const halfUsable = Math.max(160, Math.floor(rootH / 2 - gapToLine - 10));
  const cardMaxH = Math.min(600, halfUsable);

  const cardW = "w-[240px] sm:w-[310px]";
  const cardWInner = "w-[230px] sm:w-[300px]";

  const tight = cardMaxH < 230;

  // ✅ harte Mindest-Reserve für den Textbereich
  // (mit p-2, kleineren margins & ggf. Titel nur 1 Zeile in "tight" Mode)
  const textReservePx = tight ? 154 : 180;

  // ✅ Bild darf sehr klein werden, damit 2 Zeilen Beschreibung NIE verloren gehen
  const imageH = clamp(cardMaxH - textReservePx, 48, 220);

  const cardTransformAbove = `translate(-50%, calc(-100% - ${gapToLine}px))`;
  const cardTransformBelow = `translate(-50%, ${gapToLine}px)`;

  const leftVariant: "load" | "scroll" | null =
    !canLeft && hasMorePast ? "load" : canLeft ? "scroll" : null;
  const rightVariant: "load" | "scroll" | null =
    !canRight && hasMoreFuture ? "load" : canRight ? "scroll" : null;

  const showMobileLeftLoad = !canLeft && hasMorePast;
  const showMobileRightLoad = !canRight && hasMoreFuture;

  if (empty) {
    return (
      <div className="h-full w-full flex items-center justify-center min-w-0">
        <div
          className={[
            "max-w-[520px] w-full",
            "rounded-2xl border border-orange-500/35 bg-zinc-50/95 p-4 shadow-sm ring-1 ring-black/10",
            "dark:border-orange-300/20 dark:bg-white/5 dark:ring-white/10",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-orange-500/20 p-2 ring-1 ring-orange-600/25 dark:bg-orange-400/10 dark:ring-orange-300/20">
              <FaCalendarDays className="text-orange-900 dark:text-orange-200" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                Aktuell keine Termine online
              </div>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                Schau später nochmal rein - wir kündigen neue Aktionen hier an.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showRightEnd = !hasMoreFuture;
  const showLeftEnd = !hasMorePast;

  return (
    <div ref={rootRef} className="relative h-full min-w-0 overflow-y-visible">
      {/* oben rechts: Counter + optional "Ende" (rechts) */}
      <div className="pointer-events-none absolute right-3 top-2 z-30 flex items-center gap-2">
        <div
          className={[
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            "bg-white/90 ring-1 ring-black/10 text-zinc-800",
            "dark:bg-zinc-900/75 dark:ring-white/10 dark:text-zinc-200",
            "backdrop-blur",
          ].join(" ")}
          title={`${renderList.length} Termine geladen`}
        >
          {renderList.length}
        </div>

        {showRightEnd ? (
          <div
            className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400"
            title="Keine weiteren Termine in der Zukunft"
          >
            Ende
          </div>
        ) : null}
      </div>

      {/* links oben: optional "Ende" */}
      {showLeftEnd ? (
        <div
          className={[
            "pointer-events-none absolute left-3 top-2 z-30",
            "text-[11px] font-semibold text-zinc-500 dark:text-zinc-400",
          ].join(" ")}
          title="Keine weiteren Termine in der Vergangenheit"
        >
          Ende
        </div>
      ) : null}

      {/* Desktop Buttons */}
      <div className="hidden md:flex pointer-events-none absolute inset-y-0 left-2 right-2 z-30 items-center justify-between">
        <DesktopRoundButton
          variant={leftVariant ?? "scroll"}
          side="left"
          onClick={() => {
            if (leftVariant === "load") loadPast(LOAD_MORE_PAST_COUNT);
            else if (leftVariant === "scroll") scrollByOneCard("left");
          }}
          loading={leftVariant === "load" ? loadingPast : false}
          show={!!leftVariant}
        />
        <DesktopRoundButton
          variant={rightVariant ?? "scroll"}
          side="right"
          onClick={() => {
            if (rightVariant === "load") loadFuture(LOAD_MORE_FUTURE_COUNT);
            else if (rightVariant === "scroll") scrollByOneCard("right");
          }}
          loading={rightVariant === "load" ? loadingFuture : false}
          show={!!rightVariant}
        />
      </div>

      {/* Mobile Edge Load Buttons */}
      {showMobileLeftLoad ? (
        <MobileEdgeLoadButton
          side="left"
          onClick={() => loadPast(LOAD_MORE_PAST_COUNT)}
          loading={loadingPast}
        />
      ) : null}
      {showMobileRightLoad ? (
        <MobileEdgeLoadButton
          side="right"
          onClick={() => loadFuture(LOAD_MORE_FUTURE_COUNT)}
          loading={loadingFuture}
        />
      ) : null}

      {/* Mittellinie */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2",
          "h-[3px] bg-emerald-500/70",
          "dark:h-0.5 dark:bg-emerald-700/55",
        ].join(" ")}
      />

      {/* Horizontal Scroll */}
      <div
        ref={scrollerRef}
        className={[
          "no-scrollbar h-full overflow-x-auto overflow-y-visible overscroll-x-contain",
          "px-10 md:px-12",
        ].join(" ")}
      >
        <div className="relative flex h-full items-stretch gap-4 sm:gap-6 pr-6">
          {loadingInit && renderList.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`relative shrink-0 h-full ${cardW}`}>
                <div
                  aria-hidden
                  className={[
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                    "h-3.5 w-3.5 rounded-full bg-emerald-800 ring-4 ring-emerald-100",
                    "dark:bg-emerald-400 dark:ring-emerald-950/60",
                  ].join(" ")}
                />
                <div
                  className={[
                    "absolute left-1/2 top-1/2",
                    cardWInner,
                    "rounded-2xl overflow-hidden",
                    "border border-zinc-300/70 bg-zinc-50/95 p-3",
                    "dark:border-white/10 dark:bg-white/5",
                    "animate-pulse shadow-sm ring-1 ring-black/10 dark:ring-white/10",
                    "flex flex-col",
                  ].join(" ")}
                  style={{
                    transform:
                      (i + parityOffset) % 2 === 0 ? cardTransformAbove : cardTransformBelow,
                    maxHeight: cardMaxH,
                  }}
                >
                  <div
                    className="w-full rounded-xl bg-zinc-200/70 dark:bg-zinc-800/60"
                    style={{ height: imageH }}
                  />
                  <div className="mt-3 h-4 w-3/4 rounded bg-zinc-200/80 dark:bg-zinc-800/70" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-zinc-200/80 dark:bg-zinc-800/70" />
                </div>
              </div>
            ))
          ) : (
            renderList.map((e, idx) => {
              const above = (idx + parityOffset) % 2 === 0;
              const hasImg = !!e.imageUrl;

              const dataCard =
                idx === 0
                  ? { "data-event-card": "1" }
                  : idx === 1
                    ? { "data-event-card": "2" }
                    : {};

              return (
                <article
                  key={e.id}
                  data-event-id={e.id}
                  className={`relative shrink-0 h-full ${cardW} min-w-0`}
                  {...dataCard}
                >
                  <div
                    aria-hidden
                    className={[
                      "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                      "h-3.5 w-3.5 rounded-full",
                      "bg-emerald-800 ring-4 ring-emerald-100",
                      "dark:bg-emerald-400 dark:ring-emerald-950/60",
                    ].join(" ")}
                  />

                  {/* Card */}
                  <div
                    className={[
                      "absolute left-1/2 top-1/2",
                      cardWInner,
                      "rounded-2xl overflow-hidden",
                      "border border-emerald-900/15 bg-zinc-50/95 ring-1 ring-black/10 shadow-sm",
                      "dark:border-emerald-300/10 dark:bg-zinc-900/70 dark:ring-white/10",
                      "flex flex-col",
                    ].join(" ")}
                    style={{
                      transform: above ? cardTransformAbove : cardTransformBelow,
                      maxHeight: cardMaxH,
                    }}
                  >
                    {/* Bild/Placeholder */}
                    <div
                      className="relative w-full bg-zinc-100 dark:bg-zinc-800 shrink-0"
                      style={{ height: imageH }}
                    >
                      {hasImg ? (
                        <button
                          type="button"
                          onClick={() =>
                            setLightbox({ src: e.imageUrl as string, alt: e.caption })
                          }
                          className="absolute inset-0 group focus:outline-none"
                          aria-label="Bild vergrößern"
                        >
                          <Image
                            src={e.imageUrl as string}
                            alt={e.caption}
                            fill
                            className="object-cover"
                            sizes="(max-width: 400px) 230px, 300px"
                          />
                          <span
                            className={[
                              "pointer-events-none absolute bottom-2 right-2",
                              "rounded-full px-2 py-1 text-[11px] font-medium",
                              "bg-black/60 text-white backdrop-blur",
                              "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition",
                            ].join(" ")}
                          >
                            Tippen zum Zoomen
                          </span>
                        </button>
                      ) : (
                        <PlaceholderPanel startsAt={e.startsAt} endsAt={e.endsAt} />
                      )}
                    </div>

                    {/* Body: kompakter + stabil => 2 Zeilen Beschreibung immer sichtbar */}
                    <div className="p-2 sm:p-3 min-w-0 flex-1 min-h-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="min-w-0 font-semibold leading-snug text-zinc-950 dark:text-zinc-100">
                          <span
                            className={[
                              "block break-words",
                              tight ? "line-clamp-1" : "line-clamp-2",
                            ].join(" ")}
                          >
                            {e.caption}
                          </span>
                        </h3>

                        <span
                          className={[
                            "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold",
                            "bg-emerald-700/15 text-emerald-950 ring-1 ring-emerald-900/25",
                            "dark:bg-emerald-400/10 dark:text-emerald-100 dark:ring-emerald-300/20",
                          ].join(" ")}
                          title={e.startsAt}
                        >
                          {dateLabel(e.startsAt)}
                        </span>
                      </div>

                      {e.locations?.length ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {locationLabels(e.locations).map((loc) => (
                            <span
                              key={loc}
                              className={[
                                "rounded-full px-1 py-[1px]",
                                "text-[11px]",
                                "bg-emerald-700/15 text-emerald-950 ring-1 ring-emerald-900/25",
                                "dark:bg-emerald-400/10 dark:text-emerald-100 dark:ring-emerald-300/20",
                              ].join(" ")}
                            >
                              {loc}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-1.5 text-[11px] leading-4 text-zinc-800 dark:text-zinc-300 space-y-0.5 shrink-0">
                        <div>
                          <span className="font-semibold">Start:</span>{" "}
                          {timeLabel(e.startsAt)}
                        </div>
                        {e.endsAt ? (
                          <div>
                            <span className="font-semibold">Ende:</span>{" "}
                            {timeLabel(e.endsAt)}
                          </div>
                        ) : null}
                      </div>

                      {e.description ? (
                        <DescriptionBox text={e.description} />
                      ) : (
                        <div className="mt-2 h-2 shrink-0" />
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox ? (
        <div className="fixed inset-0 z-[60]" onClick={() => setLightbox(null)}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
            <div
              className={[
                "relative w-full max-w-[980px]",
                "rounded-2xl overflow-hidden",
                "bg-white ring-1 ring-black/10 shadow-lg",
                "dark:bg-zinc-950 dark:ring-white/10",
              ].join(" ")}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[70vh] max-h-[780px] bg-black">
                <Image
                  src={lightbox.src}
                  alt={lightbox.alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {lightbox.alt}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    Tippe außerhalb oder drücke ESC.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className={[
                    "shrink-0 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
                    "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 ring-1 ring-black/15 hover:ring-black/25 hover:shadow-md",
                    "dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 dark:ring-white/15 dark:hover:ring-white/25 dark:hover:shadow-md",
                    "active:scale-[0.98] transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60",
                  ].join(" ")}
                >
                  <X className="h-4 w-4" />
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
