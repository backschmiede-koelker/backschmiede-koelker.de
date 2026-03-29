// app/components/hours.tsx
import HoursGrid from "./hours-grid";
import { getWeeklyHours, listExceptions } from "../lib/opening-hours.server";
import {
  WEEKDAY_ORDER,
  rollingWeekFromToday,
  type PublicHoursEntry,
  type TimeInterval,
  type WeekdayKey,
} from "../lib/opening-hours";
import { locations } from "../data/locations";

const TIME_ZONE = "Europe/Berlin";
const RANGE_RE = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g;
const DAY_NAME_TO_WEEKDAY: Record<string, WeekdayKey> = {
  Montag: "MONDAY",
  Dienstag: "TUESDAY",
  Mittwoch: "WEDNESDAY",
  Donnerstag: "THURSDAY",
  Freitag: "FRIDAY",
  Samstag: "SATURDAY",
  Sonntag: "SUNDAY",
};

function timesToText(intervals: TimeInterval[]): string {
  if (!intervals.length) return "geschlossen";
  return intervals.map((i) => `${i.start}-${i.end} Uhr`).join(", ");
}

function parseIntervalsFromLine(line: string): TimeInterval[] {
  return Array.from(line.matchAll(RANGE_RE)).map((match) => ({
    start: match[1],
    end: match[2],
  }));
}

function fallbackWeeklyHours(lines: string[]) {
  const byWeekday = new Map<WeekdayKey, TimeInterval[]>();
  lines.forEach((line) => {
    const [rawDay] = line.split(":");
    const dayName = rawDay?.trim();
    const weekday = dayName ? DAY_NAME_TO_WEEKDAY[dayName] : undefined;
    if (!weekday) return;
    byWeekday.set(weekday, parseIntervalsFromLine(line));
  });

  return WEEKDAY_ORDER.map((weekday) => ({
    weekday,
    intervals: byWeekday.get(weekday) ?? [],
  }));
}

function buildEntries(params: {
  weekly: { weekday: WeekdayKey; intervals: TimeInterval[] }[];
  exceptions: {
    date: string;
    closed: boolean;
    intervals: TimeInterval[];
    note?: string | null;
  }[];
}): PublicHoursEntry[] {
  const weeklyMap = new Map(params.weekly.map((entry) => [entry.weekday, entry.intervals]));
  const exceptionsByDate = new Map(params.exceptions.map((ex) => [ex.date, ex]));

  return rollingWeekFromToday(TIME_ZONE).map((day) => {
    const defaultText = timesToText(weeklyMap.get(day.weekday) ?? []);
    const ex = exceptionsByDate.get(day.date);
    const overrideText = ex ? (ex.closed ? "geschlossen" : timesToText(ex.intervals ?? [])) : null;

    return {
      weekday: day.weekday,
      weekdayLabel: day.weekdayLabel,
      date: day.date,
      dateLabel: day.dateLabel,
      isToday: day.isToday,
      isException: !!ex,
      defaultText,
      overrideText,
      note: ex?.note?.trim() || null,
    };
  });
}

export default async function Hours() {
  let mettingen: PublicHoursEntry[] = [];
  let recke: PublicHoursEntry[] = [];

  try {
    const [weeklyMettingen, weeklyRecke, exceptionsMettingen, exceptionsRecke] =
      await Promise.all([
        getWeeklyHours("METTINGEN"),
        getWeeklyHours("RECKE"),
        listExceptions("METTINGEN"),
        listExceptions("RECKE"),
      ]);

    mettingen = buildEntries({
      weekly: weeklyMettingen,
      exceptions: exceptionsMettingen,
    });
    recke = buildEntries({
      weekly: weeklyRecke,
      exceptions: exceptionsRecke,
    });
  } catch {
    mettingen = buildEntries({
      weekly: fallbackWeeklyHours(locations.mettingen.fallback.weekday_text),
      exceptions: [],
    });
    recke = buildEntries({
      weekly: fallbackWeeklyHours(locations.recke.fallback.weekday_text),
      exceptions: [],
    });
  }

  return (
    <HoursGrid
      left={{ title: "Mettingen", entries: mettingen }}
      right={{ title: "Recke", entries: recke }}
    />
  );
}
