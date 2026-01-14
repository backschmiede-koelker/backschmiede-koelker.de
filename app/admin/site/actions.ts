// app/admin/site/actions.ts
"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import {
  dateToYmd,
  normalizeDateToUtc,
  normalizeIntervals,
  type TimeInterval,
  WEEKDAY_ORDER,
} from "@/app/lib/opening-hours";
import {
  getWeeklyHours,
  listExceptions,
  updateWeeklyHours,
  upsertException,
} from "@/app/lib/opening-hours.server";
import { updateSiteSettings } from "@/app/lib/site-settings.server";
import { syncBusinessHoursOrThrow } from "@/app/lib/google-business/sync";
import type { ExceptionForm, HoursPayload, SiteSettingsForm } from "./types";
import type { LocationKey } from "@/app/lib/locations";

type SessionLike = { user?: { role?: string | null } | null } | null | undefined;

function mustBeAdmin(session: SessionLike) {
  if (session?.user?.role !== "ADMIN") redirect("/login");
}

async function adminGuard() {
  const session = (await auth()) as SessionLike;
  mustBeAdmin(session);
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unbekannter Fehler.";
}

function normalizeWeekly(weekly: HoursPayload[LocationKey]) {
  const map = new Map(weekly.map((entry) => [entry.weekday, entry.intervals]));
  return WEEKDAY_ORDER.map((weekday) => ({
    weekday,
    intervals: normalizeIntervals(map.get(weekday) ?? []),
  }));
}

function normalizeExceptions(exceptions: ExceptionForm[]) {
  return exceptions
    .map((ex) => {
      const normalizedDate = normalizeDateToUtc(ex.date);
      if (!normalizedDate) {
        throw new Error("Ungültiges Datum in Ausnahmen.");
      }
      return {
        date: dateToYmd(normalizedDate),
        closed: !!ex.closed,
        intervals: normalizeIntervals(ex.intervals ?? []),
        note: ex.note?.trim() || null,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeExceptionsForSnapshot(exceptions: ExceptionForm[]) {
  return normalizeExceptions(exceptions).map((ex) => ({
    date: ex.date,
    closed: ex.closed,
    intervals: ex.intervals,
  }));
}

function snapshotPayload(payload: {
  weeklyHours: HoursPayload;
  exceptions: Record<LocationKey, ExceptionForm[]>;
}) {
  return {
    weekly: {
      METTINGEN: normalizeWeekly(payload.weeklyHours.METTINGEN),
      RECKE: normalizeWeekly(payload.weeklyHours.RECKE),
    },
    exceptions: {
      METTINGEN: normalizeExceptionsForSnapshot(payload.exceptions.METTINGEN),
      RECKE: normalizeExceptionsForSnapshot(payload.exceptions.RECKE),
    },
  };
}

async function snapshotCurrent() {
  const [weeklyMettingen, weeklyRecke, exceptionsMettingen, exceptionsRecke] =
    await Promise.all([
      getWeeklyHours("METTINGEN"),
      getWeeklyHours("RECKE"),
      listExceptions("METTINGEN"),
      listExceptions("RECKE"),
    ]);

  return {
    weekly: {
      METTINGEN: normalizeWeekly(weeklyMettingen),
      RECKE: normalizeWeekly(weeklyRecke),
    },
    exceptions: {
      METTINGEN: normalizeExceptionsForSnapshot(exceptionsMettingen),
      RECKE: normalizeExceptionsForSnapshot(exceptionsRecke),
    },
  };
}

async function replaceExceptions(location: LocationKey, exceptions: ExceptionForm[]) {
  const normalized = normalizeExceptions(exceptions);
  const dates = normalized.map((ex) => normalizeDateToUtc(ex.date) as Date);
  const seen = new Set<string>();

  for (const ex of normalized) {
    if (seen.has(ex.date)) {
      throw new Error("Pro Datum ist nur eine Ausnahme erlaubt.");
    }
    seen.add(ex.date);
  }

  await getPrisma().openingException.deleteMany({
    where: {
      location,
      ...(dates.length ? { date: { notIn: dates } } : {}),
    },
  });

  for (const ex of normalized) {
    await upsertException({
      location,
      date: ex.date,
      closed: ex.closed,
      intervals: ex.closed ? [] : (ex.intervals as TimeInterval[]),
      note: ex.note,
    });
  }
}

export async function saveSiteSettings(input: {
  settings: SiteSettingsForm;
  weeklyHours: HoursPayload;
  exceptions: Record<LocationKey, ExceptionForm[]>;
}) {
  await adminGuard();

  const before = await snapshotCurrent();
  const after = snapshotPayload({
    weeklyHours: input.weeklyHours,
    exceptions: input.exceptions,
  });

  await updateSiteSettings(input.settings);
  await updateWeeklyHours("METTINGEN", input.weeklyHours.METTINGEN);
  await updateWeeklyHours("RECKE", input.weeklyHours.RECKE);
  await replaceExceptions("METTINGEN", input.exceptions.METTINGEN);
  await replaceExceptions("RECKE", input.exceptions.RECKE);

  let syncError: string | null = null;
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    try {
      await syncBusinessHoursOrThrow(after);
    } catch (err: unknown) {
      syncError = getErrorMessage(err);
    }
  }

  return { ok: true, syncError };
}
