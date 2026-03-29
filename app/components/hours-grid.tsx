// app/components/hours-grid.tsx
"use client";
import * as React from "react";
import GoogleMapsAttribution from "./google-maps-attribution";
import type { PublicHoursEntry } from "../lib/opening-hours";

type Place = { title: string; entries: PublicHoursEntry[]; source?: string };
type Props = { left: Place; right: Place };

function multilineTimes(raw: string): string {
  if (!raw) return "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}

function isClosedText(s: string): boolean {
  return /geschlossen/i.test((s || "").trim());
}

function TodayBadge({ entry }: { entry?: PublicHoursEntry }) {
  const show = entry?.isException ? (entry.overrideText || "—") : (entry?.defaultText || "—");
  const closed = show === "—" || show === "" || isClosedText(show);

  const cls = entry?.isException
    ? closed
      ? "bg-red-600/15 text-red-800 ring-1 ring-red-600/25 dark:text-red-200 dark:ring-red-700/40"
      : "bg-amber-600/15 text-amber-900 ring-1 ring-amber-600/25 dark:text-amber-200 dark:ring-amber-700/40"
    : closed
      ? "bg-zinc-900/5 text-zinc-700 ring-1 ring-zinc-300 dark:bg-zinc-100/5 dark:text-zinc-300 dark:ring-zinc-700"
      : "bg-emerald-600/15 text-emerald-800 ring-1 ring-emerald-600/25 dark:text-emerald-200 dark:ring-emerald-700/40";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-[2px] text-[11px] font-semibold tracking-wide",
        cls,
      ].join(" ")}
      title="Heutige Öffnungszeiten"
    >
      Heute{entry?.dateLabel ? ` · ${entry.dateLabel}` : ""}: {closed ? "geschlossen" : show.replace(/\s*Uhr$/, "")}
    </span>
  );
}

function usePerIndexEqualHeights(
  leftRefs: React.MutableRefObject<(HTMLLIElement | null)[]>,
  rightRefs: React.MutableRefObject<(HTMLLIElement | null)[]>,
) {
  React.useLayoutEffect(() => {
    let raf = 0;

    const measure = () => {
      const isLg = window.matchMedia("(min-width: 1024px)").matches;
      const maxLen = Math.max(leftRefs.current.length, rightRefs.current.length);

      for (let i = 0; i < maxLen; i++) {
        const L = leftRefs.current[i];
        const R = rightRefs.current[i];
        if (L) L.style.height = "auto";
        if (R) R.style.height = "auto";
      }

      const next: number[] = [];
      for (let i = 0; i < maxLen; i++) {
        const L = leftRefs.current[i];
        const R = rightRefs.current[i];
        const lh = L ? L.getBoundingClientRect().height : 0;
        const rh = R ? R.getBoundingClientRect().height : 0;
        next[i] = isLg ? Math.ceil(Math.max(lh, rh)) : 0;
      }

      for (let i = 0; i < maxLen; i++) {
        const L = leftRefs.current[i];
        const R = rightRefs.current[i];
        const h = next[i];
        const val = h > 0 ? `${h}px` : "auto";
        if (L) L.style.height = val;
        if (R) R.style.height = val;
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(measure);
      });
    };

    schedule();
    window.addEventListener("resize", schedule);

    const ro = new ResizeObserver(schedule);
    [...leftRefs.current, ...rightRefs.current].forEach((el) => el && ro.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [leftRefs, rightRefs]);
}

function usePairEqualHeight(
  aRef: React.MutableRefObject<HTMLElement | null>,
  bRef: React.MutableRefObject<HTMLElement | null>,
) {
  React.useLayoutEffect(() => {
    let raf = 0;

    const measure = () => {
      const isLg = window.matchMedia("(min-width: 1024px)").matches;
      const A = aRef.current;
      const B = bRef.current;

      if (A) A.style.height = "auto";
      if (B) B.style.height = "auto";
      if (!A || !B) return;

      const ah = A.getBoundingClientRect().height;
      const bh = B.getBoundingClientRect().height;
      const h = isLg ? Math.ceil(Math.max(ah, bh)) : 0;

      const val = h > 0 ? `${h}px` : "auto";
      A.style.height = val;
      B.style.height = val;
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(measure);
      });
    };

    schedule();
    window.addEventListener("resize", schedule);

    const ro = new ResizeObserver(schedule);
    if (aRef.current) ro.observe(aRef.current);
    if (bRef.current) ro.observe(bRef.current);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [aRef, bRef]);
}

function WeekTable({
  entries,
  liRefs,
}: {
  entries: PublicHoursEntry[];
  liRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
}) {
  const setRowRef = (idx: number) => (el: HTMLLIElement | null) => {
    liRefs.current[idx] = el;
  };

  return (
    <ul className="divide-y divide-zinc-200/70 dark:divide-white/10 w-full">
      {entries.map((entry, i) => {
        const isException = entry.isException;
        const isToday = entry.isToday;
        const override = entry.overrideText || "";

        const overlayBg = isException
          ? "bg-amber-50/70 dark:bg-amber-900/20"
          : "bg-emerald-50/70 dark:bg-emerald-900/20";

        const dayCls = isException
          ? "font-medium text-amber-900 dark:text-amber-200"
          : isToday
            ? "font-medium text-emerald-800 dark:text-emerald-200"
            : "font-medium text-zinc-800 dark:text-zinc-100";

        const baseCls = "text-zinc-500/90 dark:text-zinc-400 line-through";
        const overrideClosed = isClosedText(override);
        const overrideCls = overrideClosed
          ? "text-red-700 dark:text-red-200 font-medium"
          : "text-amber-900 dark:text-amber-200 font-medium";

        const normalCls = isToday
          ? "text-emerald-900/90 dark:text-emerald-100"
          : "text-zinc-700 dark:text-zinc-300";

        return (
          <li ref={setRowRef(i)} key={`${entry.date}-${entry.weekday}`} className="py-1 relative">
            {isToday && (
              <span aria-hidden className={["absolute inset-0 rounded-lg", overlayBg].join(" ")} />
            )}

            <div
              className={[
                "relative z-10 grid items-center text-sm leading-5",
                "grid-cols-2 gap-x-2",
                "lg:grid-cols-[9.25rem,minmax(0,1fr)] xl:grid-cols-[10rem,minmax(0,1fr)]",
              ].join(" ")}
            >
              <div className="px-2 py-1">
                <div className="flex flex-col">
                  <span className={dayCls}>{entry.weekdayLabel}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{entry.dateLabel}</span>
                </div>
              </div>

              <div className="px-2 py-1 min-w-0">
                {!isException ? (
                  <span className={normalCls} style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
                    {multilineTimes(entry.defaultText) || "—"}
                  </span>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    <span className={baseCls} style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
                      {multilineTimes(entry.defaultText) || "—"}
                    </span>
                    <span className={overrideCls} style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
                      {multilineTimes(entry.overrideText || "") || "—"}
                    </span>
                    {entry.note ? (
                      <span className="text-xs text-amber-900/90 dark:text-amber-100/90" style={{ wordBreak: "break-word" }}>
                        Hinweis: {entry.note}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function PlaceCard({
  title,
  entries,
  source,
  liRefs,
  headerRef,
}: {
  title: string;
  entries: PublicHoursEntry[];
  source?: string;
  liRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
  headerRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const todayEntry = entries.find((entry) => entry.isToday);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl p-5 sm:p-6 bg-white/90 ring-1 ring-black/5 shadow-sm dark:bg-zinc-900/70 dark:ring-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-300/20 blur-[60px] dark:bg-emerald-700/20"
      />
      <div className="relative z-10">
        <div ref={headerRef} className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <TodayBadge entry={todayEntry} />
        </div>

        <WeekTable entries={entries} liRefs={liRefs} />

        {source && (
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Quelle:{" "}
            {source === "Google Maps" ? <GoogleMapsAttribution /> : <span>{source}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HoursGrid({ left, right }: Props) {
  const leftRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const rightRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  usePerIndexEqualHeights(leftRefs, rightRefs);

  const leftHeaderRef = React.useRef<HTMLDivElement | null>(null);
  const rightHeaderRef = React.useRef<HTMLDivElement | null>(null);
  usePairEqualHeight(leftHeaderRef, rightHeaderRef);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PlaceCard
        title={left.title}
        entries={left.entries}
        source={left.source}
        liRefs={leftRefs}
        headerRef={leftHeaderRef}
      />
      <PlaceCard
        title={right.title}
        entries={right.entries}
        source={right.source}
        liRefs={rightRefs}
        headerRef={rightHeaderRef}
      />
    </div>
  );
}
