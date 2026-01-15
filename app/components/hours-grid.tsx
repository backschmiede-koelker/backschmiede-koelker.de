// app/components/hours-grid.tsx
"use client";
import * as React from "react";
import GoogleMapsAttribution from "./google-maps-attribution";

type Place = { title: string; lines: string[]; source?: string };
type Props = { left: Place; right: Place };

// Muss zu app/components/hours.tsx passen
const EX_PREFIX = "__EX__";
const EX_SEP = "__SEP__";

function splitLine(line: string): { day: string; times: string } {
  const idx = line.indexOf(":");
  if (idx === -1) return { day: line.trim(), times: "" };
  return { day: line.slice(0, idx).trim(), times: line.slice(idx + 1).trim() };
}

function parseTimes(raw: string): {
  isException: boolean;
  base: string; // Standard
  override: string; // Ausnahme (oder leer)
} {
  const s = (raw || "").trim();
  if (!s.includes(EX_PREFIX)) return { isException: false, base: s, override: "" };

  // Erwartet: "__EX__<base>__SEP__<override>"
  const after = s.split(EX_PREFIX).slice(1).join(EX_PREFIX); // robust falls vorn Text steht
  const [base, override] = after.split(EX_SEP);
  return {
    isException: true,
    base: (base || "").trim(),
    override: (override || "").trim(),
  };
}

function multilineTimes(raw: string): string {
  if (!raw) return "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
}

// JS-Sonntag=0, Montag=1 -> wir wollen 0=Montag, ..., 6=Sonntag
function todayIndexDE(): number {
  const js = new Date().getDay();
  return (js + 6) % 7;
}

function isClosedText(s: string): boolean {
  return /geschlossen/i.test((s || "").trim());
}

function TodayBadge({ line }: { line?: string }) {
  const rawTimes = line ? splitLine(line).times || "—" : "—";
  const { isException, base, override } = parseTimes(rawTimes);

  const show = isException ? (override || "—") : (base || "—");
  const closed = show === "—" || show === "" || isClosedText(show);

  const cls = isException
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
      Heute: {closed ? "geschlossen" : show.replace(/\s*Uhr$/, "")}
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
  lines,
  liRefs,
  todayIndex,
}: {
  lines: string[];
  liRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
  todayIndex: number | null;
}) {
  const setRowRef = (idx: number) => (el: HTMLLIElement | null) => {
    liRefs.current[idx] = el;
  };

  return (
    <ul className="divide-y divide-zinc-200/70 dark:divide-white/10 w-full">
      {lines.map((line, i) => {
        const { day, times: rawTimes } = splitLine(line);
        const { isException, base, override } = parseTimes(rawTimes);
        const isToday = todayIndex === i;

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
          <li ref={setRowRef(i)} key={`${i}-${day}`} className="py-1 relative">
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
                <span className={dayCls}>{day}</span>
              </div>

              <div className="px-2 py-1 min-w-0">
                {!isException ? (
                  <span className={normalCls} style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
                    {multilineTimes(base) || "—"}
                  </span>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    <span className={baseCls} style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
                      {multilineTimes(base) || "—"}
                    </span>
                    <span className={overrideCls} style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
                      {multilineTimes(override) || "—"}
                    </span>
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
  lines,
  source,
  liRefs,
  headerRef,
  todayIndex,
}: {
  title: string;
  lines: string[];
  source?: string;
  liRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
  headerRef: React.MutableRefObject<HTMLDivElement | null>;
  todayIndex: number | null;
}) {
  const todayLine =
    todayIndex != null && todayIndex >= 0 && todayIndex < lines.length
      ? lines[todayIndex]
      : undefined;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl p-5 sm:p-6 bg-white/90 ring-1 ring-black/5 shadow-sm dark:bg-zinc-900/70 dark:ring-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-300/20 blur-[60px] dark:bg-emerald-700/20"
      />
      <div className="relative z-10">
        <div ref={headerRef} className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <TodayBadge line={todayLine} />
        </div>

        <WeekTable lines={lines} liRefs={liRefs} todayIndex={todayIndex} />

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

  const [todayIndex, setTodayIndex] = React.useState<number | null>(null);
  React.useEffect(() => {
    setTodayIndex(todayIndexDE());
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PlaceCard
        title={left.title}
        lines={left.lines}
        source={left.source}
        liRefs={leftRefs}
        headerRef={leftHeaderRef}
        todayIndex={todayIndex}
      />
      <PlaceCard
        title={right.title}
        lines={right.lines}
        source={right.source}
        liRefs={rightRefs}
        headerRef={rightHeaderRef}
        todayIndex={todayIndex}
      />
    </div>
  );
}
