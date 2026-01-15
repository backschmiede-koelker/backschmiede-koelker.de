// app/components/hours.tsx
import HoursGrid from "./hours-grid";
import { getWeeklyHours, listExceptions } from "../lib/opening-hours.server";
import {
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  type TimeInterval,
  type WeekdayKey,
} from "../lib/opening-hours";
import { locations } from "../data/locations";

const TIME_ZONE = "Europe/Berlin";

// Tokens um Default + Ausnahme in "lines: string[]" zu transportieren (ohne UI-Text wie "besonders").
const EX_PREFIX = "__EX__";
const EX_SEP = "__SEP__";

function timesToText(intervals: TimeInterval[]): string {
  if (!intervals.length) return "geschlossen";
  return intervals.map((i) => `${i.start}-${i.end} Uhr`).join(", ");
}

function ymdTodayInTimeZone(timeZone: string): string {
  // en-CA liefert zuverlässig YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function weekdayIndexMondayInTimeZone(date: Date, timeZone: string): number {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date);
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return map[wd] ?? ((date.getDay() + 6) % 7);
}

function parseYmdToUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

/**
 * Liefert die Datums-Strings (YYYY-MM-DD) für die aktuelle Woche (Mo..So) in Europe/Berlin.
 * Wichtig: SSR-sicher (Server kann UTC laufen).
 */
function weekYmdsMondayToSunday(timeZone: string): string[] {
  const todayYmd = ymdTodayInTimeZone(timeZone);
  const anchorUtc = parseYmdToUtcDate(todayYmd); // UTC Mitternacht dieses Berlin-Datums

  const idx = weekdayIndexMondayInTimeZone(anchorUtc, timeZone);
  const mondayUtc = new Date(anchorUtc);
  mondayUtc.setUTCDate(mondayUtc.getUTCDate() - idx);

  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayUtc);
    d.setUTCDate(mondayUtc.getUTCDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function buildLines(params: {
  weekly: { weekday: WeekdayKey; intervals: TimeInterval[] }[];
  exceptions: { date: string; closed: boolean; intervals: TimeInterval[] }[];
}) {
  const weeklyMap = new Map(params.weekly.map((entry) => [entry.weekday, entry.intervals]));
  const exceptionsByDate = new Map(params.exceptions.map((ex) => [ex.date, ex]));

  const weekDates = weekYmdsMondayToSunday(TIME_ZONE); // index 0..6 entspricht WEEKDAY_ORDER (Mo..So)

  return WEEKDAY_ORDER.map((weekday, idx) => {
    const label = WEEKDAY_LABELS[weekday];
    const defaultTimes = timesToText(weeklyMap.get(weekday) ?? []);

    const dateYmd = weekDates[idx];
    const ex = dateYmd ? exceptionsByDate.get(dateYmd) : undefined;

    if (!ex) {
      return `${label}: ${defaultTimes}`;
    }

    const exceptionTimes = ex.closed ? "geschlossen" : timesToText(ex.intervals ?? []);
    // Format: "Tag: __EX__<default>__SEP__<override>"
    return `${label}: ${EX_PREFIX}${defaultTimes}${EX_SEP}${exceptionTimes}`;
  });
}

export default async function Hours() {
  let mettingen: string[] = [];
  let recke: string[] = [];

  try {
    const [weeklyMettingen, weeklyRecke, exceptionsMettingen, exceptionsRecke] =
      await Promise.all([
        getWeeklyHours("METTINGEN"),
        getWeeklyHours("RECKE"),
        listExceptions("METTINGEN"),
        listExceptions("RECKE"),
      ]);

    mettingen = buildLines({
      weekly: weeklyMettingen,
      exceptions: exceptionsMettingen,
    });
    recke = buildLines({
      weekly: weeklyRecke,
      exceptions: exceptionsRecke,
    });
  } catch {
    mettingen = locations.mettingen.fallback.weekday_text;
    recke = locations.recke.fallback.weekday_text;
  }

  return (
    <HoursGrid
      left={{ title: "Mettingen", lines: mettingen }}
      right={{ title: "Recke", lines: recke }}
    />
  );
}
