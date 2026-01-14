// app/components/hours-grid.tsx
"use client";
import * as React from "react";
import GoogleMapsAttribution from "./google-maps-attribution";

type HourRow = {
  weekday: string;
  dayLabel: string;
  date: string; // YYYY-MM-DD
  standardTimes: string; // z.B. "07:00-12:30 Uhr, 14:30-18:00 Uhr" oder "geschlossen"
  specialTimes: string | null; // wenn Ausnahme gespeichert wurde
};

type Place = { title: string; rows: HourRow[]; todayYmd: string; source?: string };
type Props = { left: Place; right: Place };

function multilineTimes(raw: string): string {
  if (!raw) return "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}

function TodayBadge({ row }: { row?: HourRow }) {
  const times = row?.specialTimes ?? row?.standardTimes ?? "—";
  const closed = /geschlossen/i.test(times) || times === "—" || times === "";
  const isSpecial = !!row?.specialTimes;

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-2 py-[2px] text-[11px] font-semibold tracking-wide ring-1",
        closed
          ? "bg-zinc-900/5 text-zinc-700 ring-zinc-300 dark:bg-zinc-100/5 dark:text-zinc-300 dark:ring-zinc-700"
          : "bg-emerald-600/15 text-emerald-800 ring-emerald-600/25 dark:text-emerald-200 dark:ring-emerald-700/40",
      ].join(" ")}
      title="Heutige Öffnungszeiten"
    >
      <span>Heute:</span>
      <span>{closed ? "geschlossen" : times.replace(/\s*Uhr$/, "")}</span>
      {isSpecial ? (
        <span className="rounded-full bg-amber-400/20 px-1.5 py-[1px] text-[10px] font-bold text-amber-900/80 dark:text-amber-100">
          besonders
        </span>
      ) : null}
    </span>
  );
}

function usePerIndexEqualHeights(
  leftRefs: React.MutableRefObject<(HTMLLIElement | null)[]>,
  rightRefs: React.MutableRefObject<(HTMLLIElement | null)[]>,
) {
  const [heights, setHeights] = React.useState<number[]>([]);

  React.useLayoutEffect(() => {
    let raf = 0;

    const measure = () => {
      const isLg = window.matchMedia("(min-width: 1024px)").matches;
      const maxLen = Math.max(leftRefs.current.length, rightRefs.current.length);

      for (let i = 0; i < maxLen; i++) {
        const L = leftRefs.current[i];
        const R = rightRefs.current[i];
        if (L) {
          L.style.minHeight = "";
          L.style.height = "auto";
        }
        if (R) {
          R.style.minHeight = "";
          R.style.height = "auto";
        }
      }

      const next: number[] = [];
      for (let i = 0; i < maxLen; i++) {
        const L = leftRefs.current[i];
        const R = rightRefs.current[i];
        const lh = L ? L.getBoundingClientRect().height : 0;
        const rh = R ? R.getBoundingClientRect().height : 0;
        next[i] = isLg ? Math.ceil(Math.max(lh, rh)) : 0;
      }
      setHeights(next);

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
    const onResize = () => schedule();
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => schedule());
    [...leftRefs.current, ...rightRefs.current].forEach((el) => el && ro.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [leftRefs, rightRefs]);

  return heights;
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
    const onResize = () => schedule();
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => schedule());
    if (aRef.current) ro.observe(aRef.current);
    if (bRef.current) ro.observe(bRef.current);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [aRef, bRef]);
}

function WeekTable({
  rows,
  liRefs,
  todayYmd,
}: {
  rows: HourRow[];
  liRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
  todayYmd: string;
}) {
  const setRowRef = (idx: number) => (el: HTMLLIElement | null) => {
    liRefs.current[idx] = el;
  };

  return (
    <ul className="divide-y divide-zinc-200/70 dark:divide-white/10 w-full">
      {rows.map((row, i) => {
        const isToday = row.date === todayYmd;
        const isSpecial = !!row.specialTimes;

        return (
          <li ref={setRowRef(i)} key={`${row.date}-${row.dayLabel}`} className="py-1 relative">
            {isToday && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-lg bg-emerald-50/70 dark:bg-emerald-900/20"
              />
            )}

            <div
              className={[
                "relative z-10 grid text-sm leading-5",
                "grid-cols-2 gap-x-2 items-start",
                "lg:grid-cols-[9.25rem,minmax(0,1fr)] xl:grid-cols-[10rem,minmax(0,1fr)]",
              ].join(" ")}
            >
              <div className="px-2 py-1">
                <div
                  className={[
                    "font-medium",
                    isToday
                      ? "text-emerald-800 dark:text-emerald-200"
                      : "text-zinc-800 dark:text-zinc-100",
                  ].join(" ")}
                >
                  {row.dayLabel}
                </div>
                {isSpecial ? (
                  <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-200">
                    {row.date}
                  </div>
                ) : null}
              </div>

              <div className="px-2 py-1 min-w-0">
                {isSpecial ? (
                  <div className="space-y-1">
                    <span
                      className="block text-zinc-500 dark:text-zinc-400 line-through"
                      style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}
                    >
                      {multilineTimes(row.standardTimes) || "—"}
                    </span>
                    <span
                      className={[
                        "block font-semibold",
                        isToday
                          ? "text-emerald-900/90 dark:text-emerald-100"
                          : "text-amber-900/90 dark:text-amber-100",
                      ].join(" ")}
                      style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}
                    >
                      {multilineTimes(row.specialTimes ?? "") || "—"}
                    </span>
                    <span className="inline-flex w-fit rounded-full bg-amber-400/20 px-2 py-[2px] text-[11px] font-semibold text-amber-900/80 dark:text-amber-100">
                      besonders
                    </span>
                  </div>
                ) : (
                  <span
                    className={
                      isToday
                        ? "text-emerald-900/90 dark:text-emerald-100"
                        : "text-zinc-700 dark:text-zinc-300"
                    }
                    style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}
                  >
                    {multilineTimes(row.standardTimes) || "—"}
                  </span>
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
  rows,
  source,
  liRefs,
  headerRef,
  todayYmd,
}: {
  title: string;
  rows: HourRow[];
  source?: string;
  liRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
  headerRef: React.MutableRefObject<HTMLDivElement | null>;
  todayYmd: string;
}) {
  const todayRow = rows.find((r) => r.date === todayYmd);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl p-5 sm:p-6 bg-white/90 ring-1 ring-black/5 shadow-sm dark:bg-zinc-900/70 dark:ring-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-300/20 blur-[60px] dark:bg-emerald-700/20"
      />
      <div className="relative z-10">
        <div ref={headerRef} className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <TodayBadge row={todayRow} />
        </div>

        <WeekTable rows={rows} liRefs={liRefs} todayYmd={todayYmd} />

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
        rows={left.rows}
        source={left.source}
        liRefs={leftRefs}
        headerRef={leftHeaderRef}
        todayYmd={left.todayYmd}
      />
      <PlaceCard
        title={right.title}
        rows={right.rows}
        source={right.source}
        liRefs={rightRefs}
        headerRef={rightHeaderRef}
        todayYmd={right.todayYmd}
      />
    </div>
  );
}
