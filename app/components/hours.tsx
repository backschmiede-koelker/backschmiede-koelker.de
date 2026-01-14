// app/components/hours.tsx
import HoursGrid from "./hours-grid";
import { getWeeklyHours, listExceptions } from "../lib/opening-hours.server";
import {
  WEEKDAY_ORDER,
  WEEKDAY_LABELS,
  todayLocalYmd,
  type TimeInterval,
  type WeekdayKey,
} from "../lib/opening-hours";
import { locations } from "../data/locations";

function intervalsToTimes(intervals: TimeInterval[]): string {
  if (!intervals.length) return "geschlossen";
  return intervals.map((i) => `${i.start}-${i.end} Uhr`).join(", ");
}

function startOfWeekMondayLocal(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const jsDay = x.getDay(); // 0=So..6=Sa
  const mondayIndex = (jsDay + 6) % 7; // 0=Mo..6=So
  x.setDate(x.getDate() - mondayIndex);
  return x;
}

function toLocalYmd(d: Date): string {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

type WeeklyDTO = { weekday: WeekdayKey; intervals: TimeInterval[] };
type ExceptionDTO = { date: string; closed: boolean; intervals: TimeInterval[]; note?: string | null };

function buildRows(params: { weekly: WeeklyDTO[]; exceptions: ExceptionDTO[] }) {
  const weeklyMap = new Map(params.weekly.map((entry) => [entry.weekday, entry.intervals]));
  const exceptionsMap = new Map(params.exceptions.map((ex) => [ex.date, ex]));

  const now = new Date();
  const weekStart = startOfWeekMondayLocal(now);
  const rows = WEEKDAY_ORDER.map((weekday, idx) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + idx);
    const ymd = toLocalYmd(dayDate);

    const standardIntervals = weeklyMap.get(weekday) ?? [];
    const standardTimes = intervalsToTimes(standardIntervals);

    const ex = exceptionsMap.get(ymd);
    if (!ex) {
      return {
        weekday,
        dayLabel: WEEKDAY_LABELS[weekday],
        date: ymd,
        standardTimes,
        specialTimes: null as string | null,
      };
    }

    const specialTimes = ex.closed ? "geschlossen" : intervalsToTimes(ex.intervals);
    return {
      weekday,
      dayLabel: WEEKDAY_LABELS[weekday],
      date: ymd,
      standardTimes,
      specialTimes,
    };
  });

  return rows;
}

export default async function Hours() {
  let mettingen:
    | ReturnType<typeof buildRows>
    | null = null;
  let recke:
    | ReturnType<typeof buildRows>
    | null = null;

  try {
    const [weeklyMettingen, weeklyRecke, exceptionsMettingen, exceptionsRecke] =
      await Promise.all([
        getWeeklyHours("METTINGEN"),
        getWeeklyHours("RECKE"),
        listExceptions("METTINGEN"),
        listExceptions("RECKE"),
      ]);

    mettingen = buildRows({
      weekly: weeklyMettingen,
      exceptions: exceptionsMettingen,
    });
    recke = buildRows({
      weekly: weeklyRecke,
      exceptions: exceptionsRecke,
    });
  } catch {
    // Fallback: altes string-format → wir mappen grob ins neue Row-Format
    const now = new Date();
    const weekStart = startOfWeekMondayLocal(now);

    mettingen = WEEKDAY_ORDER.map((weekday, idx) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + idx);
      const ymd = toLocalYmd(dayDate);
      const line = locations.mettingen.fallback.weekday_text[idx] ?? `${WEEKDAY_LABELS[weekday]}: —`;
      const times = line.includes(":") ? line.split(":").slice(1).join(":").trim() : "—";
      return { weekday, dayLabel: WEEKDAY_LABELS[weekday], date: ymd, standardTimes: times, specialTimes: null };
    });

    recke = WEEKDAY_ORDER.map((weekday, idx) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + idx);
      const ymd = toLocalYmd(dayDate);
      const line = locations.recke.fallback.weekday_text[idx] ?? `${WEEKDAY_LABELS[weekday]}: —`;
      const times = line.includes(":") ? line.split(":").slice(1).join(":").trim() : "—";
      return { weekday, dayLabel: WEEKDAY_LABELS[weekday], date: ymd, standardTimes: times, specialTimes: null };
    });
  }

  const today = todayLocalYmd();

  return (
    <HoursGrid
      left={{ title: "Mettingen", rows: mettingen ?? [], todayYmd: today }}
      right={{ title: "Recke", rows: recke ?? [], todayYmd: today }}
    />
  );
}
