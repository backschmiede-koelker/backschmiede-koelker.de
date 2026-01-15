// app/lib/opening-hours.server.ts
import "server-only";

import { getPrisma } from "@/lib/prisma";
import { locations } from "@/app/data/locations";
import type { Location, Weekday } from "@/generated/prisma/client";
import {
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
  type TimeInterval,
  type WeekdayKey,
  dateToYmd,
  isValidTime,
  normalizeDateToUtc,
  normalizeIntervals,
} from "./opening-hours";

export type WeeklyHoursDTO = { weekday: WeekdayKey; intervals: TimeInterval[] };
export type OpeningExceptionDTO = {
  id: string;
  location: Location;
  date: string;
  closed: boolean;
  intervals: TimeInterval[];
  note: string | null;
};

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

function coerceIntervals(value: unknown): TimeInterval[] {
  if (!Array.isArray(value)) return [];
  const out: TimeInterval[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const start = (entry as { start?: unknown }).start;
    const end = (entry as { end?: unknown }).end;
    if (typeof start !== "string" || typeof end !== "string") continue;
    out.push({ start, end });
  }
  return normalizeIntervals(out);
}

function parseIntervalsFromLine(line: string): TimeInterval[] {
  const matches = Array.from(line.matchAll(RANGE_RE));
  return matches.map((m) => ({ start: m[1], end: m[2] }));
}

function fallbackIntervalsByWeekday(lines: string[]): Partial<Record<WeekdayKey, TimeInterval[]>> {
  const out: Partial<Record<WeekdayKey, TimeInterval[]>> = {};
  for (const line of lines) {
    const [rawDay] = line.split(":");
    const weekday = rawDay ? DAY_NAME_TO_WEEKDAY[rawDay.trim()] : undefined;
    if (!weekday) continue;
    out[weekday] = parseIntervalsFromLine(line);
  }
  return out;
}

function validateIntervals(intervals: TimeInterval[], label: string) {
  for (const interval of intervals) {
    if (!isValidTime(interval.start) || !isValidTime(interval.end)) {
      throw new Error(`${label}: Ungltige Uhrzeit (HH:MM).`);
    }
    if (interval.start >= interval.end) {
      throw new Error(`${label}: Startzeit muss vor Endzeit liegen.`);
    }
  }
}

async function ensureOpeningHoursDefaults() {
  const prisma = getPrisma();
  const existing = await prisma.openingHour.findMany({
    select: { location: true, weekday: true },
  });

  const existingSet = new Set(existing.map((row) => `${row.location}:${row.weekday}`));
  const mettingenFallback = fallbackIntervalsByWeekday(locations.mettingen.fallback.weekday_text);
  const reckeFallback = fallbackIntervalsByWeekday(locations.recke.fallback.weekday_text);

  const toCreate: { location: Location; weekday: Weekday; intervals: TimeInterval[] }[] = [];

  for (const location of ["METTINGEN", "RECKE"] as const) {
    const fallback =
      location === "METTINGEN" ? mettingenFallback : reckeFallback;
    for (const weekday of WEEKDAY_ORDER) {
      const key = `${location}:${weekday}`;
      if (existingSet.has(key)) continue;
      toCreate.push({
        location,
        weekday: weekday as Weekday,
        intervals: normalizeIntervals(fallback[weekday] ?? []),
      });
    }
  }

  if (toCreate.length) {
    await prisma.openingHour.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }
}

export async function getWeeklyHours(location: Location): Promise<WeeklyHoursDTO[]> {
  await ensureOpeningHoursDefaults();
  const rows = await getPrisma().openingHour.findMany({
    where: { location },
  });

  const map = new Map(rows.map((row) => [row.weekday, row.intervals]));

  return WEEKDAY_ORDER.map((weekday) => ({
    weekday,
    intervals: coerceIntervals(map.get(weekday as Weekday)),
  }));
}

export async function updateWeeklyHours(
  location: Location,
  payload: WeeklyHoursDTO[],
) {
  await ensureOpeningHoursDefaults();
  const byWeekday = new Map(
    payload.map((entry) => [entry.weekday, normalizeIntervals(entry.intervals)]),
  );

  for (const [weekday, intervals] of byWeekday.entries()) {
    validateIntervals(intervals, WEEKDAY_LABELS[weekday]);
  }

  await getPrisma().$transaction(async (tx) => {
    for (const weekday of WEEKDAY_ORDER) {
      const intervals = byWeekday.get(weekday) ?? [];
      await tx.openingHour.upsert({
        where: {
          location_weekday: {
            location,
            weekday: weekday as Weekday,
          },
        },
        create: {
          location,
          weekday: weekday as Weekday,
          intervals,
        },
        update: {
          intervals,
        },
      });
    }
  });
}

export async function listExceptions(location: Location): Promise<OpeningExceptionDTO[]> {
  const rows = await getPrisma().openingException.findMany({
    where: { location },
    orderBy: { date: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    location: row.location,
    date: dateToYmd(row.date),
    closed: row.closed,
    intervals: coerceIntervals(row.intervals),
    note: row.note ?? null,
  }));
}

export async function upsertException(input: {
  location: Location;
  date: string;
  closed: boolean;
  intervals: TimeInterval[];
  note?: string | null;
}) {
  const normalizedDate = normalizeDateToUtc(input.date);
  if (!normalizedDate) {
    throw new Error("Ungltiges Datum.");
  }

  const intervals = normalizeIntervals(input.intervals);
  if (!input.closed) {
    validateIntervals(intervals, "Ausnahme");
  }

  await getPrisma().openingException.upsert({
    where: {
      location_date: {
        location: input.location,
        date: normalizedDate,
      },
    },
    create: {
      location: input.location,
      date: normalizedDate,
      closed: !!input.closed,
      intervals: input.closed ? [] : intervals,
      note: input.note?.trim() || null,
    },
    update: {
      closed: !!input.closed,
      intervals: input.closed ? [] : intervals,
      note: input.note?.trim() || null,
    },
  });
}

export async function deleteException(id: string) {
  await getPrisma().openingException.delete({ where: { id } });
}
