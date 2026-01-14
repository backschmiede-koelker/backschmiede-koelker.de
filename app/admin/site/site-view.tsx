// app/admin/site/site-view.tsx
"use client";

import { useMemo, useState } from "react";
import AdminPageHeader from "../components/admin-page-header";
import SectionCard from "@/app/components/ui/section-card";
import FieldLabel from "@/app/components/ui/field-label";
import ImageUploader from "@/app/components/image-uploader";
import { LOCATION_OPTIONS, locationLabel, type LocationKey } from "@/app/lib/locations";
import {
  WEEKDAY_LABELS,
  isValidTime,
  type TimeInterval,
  type WeekdayKey,
} from "@/app/lib/opening-hours";
import { saveSiteSettings } from "./actions";
import type {
  ExceptionForm,
  ExceptionsPayload,
  HoursPayload,
  SiteSettingsForm,
} from "./types";

function validateIntervals(
  intervals: TimeInterval[],
  label: string,
): string | null {
  for (const interval of intervals) {
    if (!isValidTime(interval.start) || !isValidTime(interval.end)) {
      return `${label}: Ungültige Uhrzeit (HH:MM).`;
    }
    if (interval.start >= interval.end) {
      return `${label}: Startzeit muss vor Endzeit liegen.`;
    }
  }
  return null;
}

type SaveScope = "HERO" | "SUBTITLES" | "HOURS" | "FOOTER";

export default function AdminSiteView({
  initialSettings,
  initialWeeklyHours,
  initialExceptions,
}: {
  initialSettings: SiteSettingsForm;
  initialWeeklyHours: HoursPayload;
  initialExceptions: ExceptionsPayload;
}) {
  const [settings, setSettings] = useState<SiteSettingsForm>(initialSettings);
  const [weeklyHours, setWeeklyHours] =
    useState<HoursPayload>(initialWeeklyHours);
  const [exceptions, setExceptions] =
    useState<ExceptionsPayload>(initialExceptions);

  const [activeLocation, setActiveLocation] =
    useState<LocationKey>("METTINGEN");

  const [newExceptionDate, setNewExceptionDate] = useState<Record<
    LocationKey,
    string
  >>({
    METTINGEN: "",
    RECKE: "",
  });

  const [savingScope, setSavingScope] = useState<SaveScope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  type WeeklyHoursList = HoursPayload[LocationKey];

  const activeWeek = weeklyHours[activeLocation];
  const activeExceptions = exceptions[activeLocation];

  function updateSetting<K extends keyof SiteSettingsForm>(
    key: K,
    value: SiteSettingsForm[K],
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function setWeekForLocation(
    location: LocationKey,
    updater: (prev: WeeklyHoursList) => WeeklyHoursList,
  ) {
    setWeeklyHours((prev) => ({
      ...prev,
      [location]: updater(prev[location]),
    }));
  }

  function setExceptionsForLocation(
    location: LocationKey,
    next: ExceptionForm[],
  ) {
    const sorted = next
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
    setExceptions((prev) => ({ ...prev, [location]: sorted }));
  }

  function updateInterval(
    location: LocationKey,
    weekday: WeekdayKey,
    index: number,
    field: keyof TimeInterval,
    value: string,
  ) {
    setWeekForLocation(location, (prevWeek) =>
      prevWeek.map((day) => {
        if (day.weekday !== weekday) return day;
        const intervals = day.intervals.map((interval, i) =>
          i === index ? { ...interval, [field]: value } : interval,
        );
        return { ...day, intervals };
      }),
    );
  }

  function addInterval(location: LocationKey, weekday: WeekdayKey) {
    setWeekForLocation(location, (prevWeek) =>
      prevWeek.map((day) => {
        if (day.weekday !== weekday) return day;
        return {
          ...day,
          intervals: [...day.intervals, { start: "", end: "" }],
        };
      }),
    );
  }

  function removeInterval(location: LocationKey, weekday: WeekdayKey, index: number) {
    setWeekForLocation(location, (prevWeek) =>
      prevWeek.map((day) => {
        if (day.weekday !== weekday) return day;
        return {
          ...day,
          intervals: day.intervals.filter((_, i) => i !== index),
        };
      }),
    );
  }

  function addException(location: LocationKey) {
    const date = newExceptionDate[location];
    if (!date) {
      setError("Bitte ein Datum für die Ausnahme wählen.");
      return;
    }
    if (exceptions[location].some((ex) => ex.date === date)) {
      setError("Für dieses Datum existiert bereits eine Ausnahme.");
      return;
    }

    const next = [
      ...exceptions[location],
      { date, closed: false, intervals: [{ start: "", end: "" }] },
    ];
    setExceptionsForLocation(location, next);
    setNewExceptionDate((prev) => ({ ...prev, [location]: "" }));
  }

  function updateException(
    location: LocationKey,
    index: number,
    patch: Partial<ExceptionForm>,
  ) {
    const next = exceptions[location].map((ex, idx) =>
      idx === index ? { ...ex, ...patch } : ex,
    );
    setExceptionsForLocation(location, next);
  }

  function deleteException(location: LocationKey, index: number) {
    const next = exceptions[location].filter((_, idx) => idx !== index);
    setExceptionsForLocation(location, next);
  }

  const validationError = useMemo(() => {
    for (const location of LOCATION_OPTIONS) {
      for (const day of weeklyHours[location]) {
        const err = validateIntervals(
          day.intervals,
          `${locationLabel(location)} - ${WEEKDAY_LABELS[day.weekday]}`,
        );
        if (err) return err;
      }

      for (const ex of exceptions[location]) {
        if (ex.closed) continue;
        const err = validateIntervals(
          ex.intervals,
          `${locationLabel(location)} - Ausnahme ${ex.date}`,
        );
        if (err) return err;
      }
    }
    return null;
  }, [exceptions, weeklyHours]);

  async function save(scope: SaveScope) {
    setError(null);
    setSuccess(null);
    setSyncError(null);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingScope(scope);
    try {
      const res = await saveSiteSettings({
        settings,
        weeklyHours,
        exceptions,
      });

      const label =
        scope === "HERO"
          ? "Hero"
          : scope === "SUBTITLES"
          ? "Untertitel"
          : scope === "HOURS"
          ? "Öffnungszeiten"
          : "Footer";

      setSuccess(`${label} gespeichert.`);
      if (res.syncError) {
        setSyncError(`Gespeichert, aber Google-Sync fehlgeschlagen: ${res.syncError}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern.");
    } finally {
      setSavingScope(null);
    }
  }

  const savingHero = savingScope === "HERO";
  const savingSubtitles = savingScope === "SUBTITLES";
  const savingHours = savingScope === "HOURS";
  const savingFooter = savingScope === "FOOTER";

  return (
    <main className="mx-auto w-full max-w-5xl px-3.5 sm:px-6 md:px-8 py-6 md:py-10 min-w-0">
      <AdminPageHeader
        title="Startseite"
        subtitle="Hero, Öffnungszeiten und Footer für die Startseite pflegen."
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          {success}
        </div>
      ) : null}

      {syncError ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          {syncError}
        </div>
      ) : null}

      <SectionCard className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Hero</h2>
          <button
            type="button"
            onClick={() => save("HERO")}
            disabled={savingScope != null}
            className="w-full sm:w-auto rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {savingHero ? "Speichere…" : "Speichern"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Badge</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.heroBadge}
              onChange={(e) => updateSetting("heroBadge", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Titel (Zeile 1)</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.heroTitleLine1}
              onChange={(e) => updateSetting("heroTitleLine1", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Titel (Zeile 2)</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.heroTitleLine2}
              onChange={(e) => updateSetting("heroTitleLine2", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <FieldLabel>Beschreibung</FieldLabel>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.heroDescription}
              onChange={(e) => updateSetting("heroDescription", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Tag 1</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.heroTag1}
              onChange={(e) => updateSetting("heroTag1", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Tag 2</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.heroTag2}
              onChange={(e) => updateSetting("heroTag2", e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Tag 3</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.heroTag3}
              onChange={(e) => updateSetting("heroTag3", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <FieldLabel hint="Wird relativ in der DB gespeichert (ohne /uploads).">
                Bild Mettingen
              </FieldLabel>
              <div className="mt-2">
                <ImageUploader
                  folder="site"
                  imageUrl={settings.heroImageMettingen}
                  onChange={(url) => updateSetting("heroImageMettingen", url)}
                />
              </div>
            </div>

            <div className="min-w-0">
              <FieldLabel hint="Wird relativ in der DB gespeichert (ohne /uploads).">
                Bild Recke
              </FieldLabel>
              <div className="mt-2">
                <ImageUploader
                  folder="site"
                  imageUrl={settings.heroImageRecke}
                  onChange={(url) => updateSetting("heroImageRecke", url)}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Untertitel</h2>
          <button
            type="button"
            onClick={() => save("SUBTITLES")}
            disabled={savingScope != null}
            className="w-full sm:w-auto rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {savingSubtitles ? "Speichere…" : "Speichern"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel hint="Optionaler Untertitel für Aktuelles.">
              Aktuelles
            </FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.subtitleNews ?? ""}
              onChange={(e) =>
                updateSetting("subtitleNews", e.target.value || null)
              }
            />
          </div>
          <div>
            <FieldLabel hint="Optionaler Untertitel für Angebote.">
              Angebote
            </FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.subtitleOffers ?? ""}
              onChange={(e) =>
                updateSetting("subtitleOffers", e.target.value || null)
              }
            />
          </div>
          <div>
            <FieldLabel hint="Optionaler Untertitel für Öffnungszeiten.">
              Öffnungszeiten
            </FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.subtitleHours ?? ""}
              onChange={(e) =>
                updateSetting("subtitleHours", e.target.value || null)
              }
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Öffnungszeiten</h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-zinc-200/70 dark:border-zinc-700/80 bg-white/60 dark:bg-zinc-900/60 p-1">
              {LOCATION_OPTIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setActiveLocation(loc)}
                  className={[
                    "px-3 py-1.5 text-sm rounded-lg transition",
                    activeLocation === loc
                      ? "bg-emerald-600 text-white"
                      : "text-zinc-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30",
                  ].join(" ")}
                >
                  {locationLabel(loc)}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => save("HOURS")}
              disabled={savingScope != null}
              className="w-full sm:w-auto rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {savingHours ? "Speichere…" : "Speichern"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid gap-3">
            {activeWeek.map((day) => (
              <div
                key={`${activeLocation}-${day.weekday}`}
                className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/50 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-medium">
                    {WEEKDAY_LABELS[day.weekday]}
                  </div>
                  <button
                    type="button"
                    onClick={() => addInterval(activeLocation, day.weekday)}
                    className="text-xs rounded-md border border-emerald-200 px-2 py-1 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
                  >
                    + Zeit hinzufügen
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {day.intervals.length === 0 ? (
                    <div className="text-xs text-zinc-500">
                      Keine Zeiten (geschlossen).
                    </div>
                  ) : null}
                  {day.intervals.map((interval, idx) => (
                    <div
                      key={`${day.weekday}-${idx}`}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input
                        type="time"
                        className="rounded-md border px-2 py-1 bg-white dark:bg-zinc-800"
                        value={interval.start}
                        onChange={(e) =>
                          updateInterval(
                            activeLocation,
                            day.weekday,
                            idx,
                            "start",
                            e.target.value,
                          )
                        }
                      />
                      <span className="text-sm text-zinc-500">bis</span>
                      <input
                        type="time"
                        className="rounded-md border px-2 py-1 bg-white dark:bg-zinc-800"
                        value={interval.end}
                        onChange={(e) =>
                          updateInterval(
                            activeLocation,
                            day.weekday,
                            idx,
                            "end",
                            e.target.value,
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeInterval(activeLocation, day.weekday, idx)
                        }
                        className="text-xs rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50 dark:border-red-800/60 dark:text-red-200 dark:hover:bg-red-900/30"
                      >
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">Ausnahmen</div>
                <div className="text-xs text-zinc-500">
                  Sonderöffnungszeiten oder Schließtage.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  className="rounded-md border px-2 py-1 bg-white dark:bg-zinc-800"
                  value={newExceptionDate[activeLocation]}
                  onChange={(e) =>
                    setNewExceptionDate((prev) => ({
                      ...prev,
                      [activeLocation]: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => addException(activeLocation)}
                  className="text-xs rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                >
                  Hinzufügen
                </button>
                <button
                  type="button"
                  onClick={() => save("HOURS")}
                  disabled={savingScope != null}
                  className="w-full sm:w-auto rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {savingHours ? "Speichere…" : "Speichern"}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {activeExceptions.length === 0 ? (
                <div className="text-xs text-zinc-500">
                  Keine Ausnahmen für {locationLabel(activeLocation)}.
                </div>
              ) : null}

              {activeExceptions.map((ex, idx) => (
                <div
                  key={`${activeLocation}-${ex.date}-${idx}`}
                  className="rounded-lg border border-zinc-200/70 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-900/60 p-3"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="date"
                      className="rounded-md border px-2 py-1 bg-white dark:bg-zinc-800"
                      value={ex.date}
                      onChange={(e) => {
                        const nextDate = e.target.value;
                        if (
                          activeExceptions.some(
                            (other, otherIdx) =>
                              otherIdx !== idx && other.date === nextDate,
                          )
                        ) {
                          setError("Für dieses Datum existiert bereits eine Ausnahme.");
                          return;
                        }
                        updateException(activeLocation, idx, { date: nextDate });
                      }}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={ex.closed}
                        onChange={(e) =>
                          updateException(activeLocation, idx, {
                            closed: e.target.checked,
                          })
                        }
                      />
                      Geschlossen
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteException(activeLocation, idx)}
                      className="ml-auto text-xs rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50 dark:border-red-800/60 dark:text-red-200 dark:hover:bg-red-900/30"
                    >
                      Löschen
                    </button>
                  </div>

                  {!ex.closed && (
                    <div className="mt-3 space-y-2">
                      {ex.intervals.map((interval, i) => (
                        <div
                          key={`${ex.date}-${i}`}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <input
                            type="time"
                            className="rounded-md border px-2 py-1 bg-white dark:bg-zinc-800"
                            value={interval.start}
                            onChange={(e) => {
                              const intervals = ex.intervals.map((item, idx2) =>
                                idx2 === i
                                  ? { ...item, start: e.target.value }
                                  : item,
                              );
                              updateException(activeLocation, idx, { intervals });
                            }}
                          />
                          <span className="text-sm text-zinc-500">bis</span>
                          <input
                            type="time"
                            className="rounded-md border px-2 py-1 bg-white dark:bg-zinc-800"
                            value={interval.end}
                            onChange={(e) => {
                              const intervals = ex.intervals.map((item, idx2) =>
                                idx2 === i
                                  ? { ...item, end: e.target.value }
                                  : item,
                              );
                              updateException(activeLocation, idx, { intervals });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const intervals = ex.intervals.filter(
                                (_, idx2) => idx2 !== i,
                              );
                              updateException(activeLocation, idx, { intervals });
                            }}
                            className="text-xs rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50 dark:border-red-800/60 dark:text-red-200 dark:hover:bg-red-900/30"
                          >
                            Entfernen
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          updateException(activeLocation, idx, {
                            intervals: [...ex.intervals, { start: "", end: "" }],
                          });
                        }}
                        className="text-xs rounded-md border border-emerald-200 px-2 py-1 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
                      >
                        + Zeit hinzufügen
                      </button>
                    </div>
                  )}

                  <div className="mt-3">
                    <FieldLabel hint="Optional, nur intern sichtbar.">
                      Notiz
                    </FieldLabel>
                    <input
                      className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
                      value={ex.note ?? ""}
                      onChange={(e) =>
                        updateException(activeLocation, idx, {
                          note: e.target.value || null,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Footer</h2>
          <button
            type="button"
            onClick={() => save("FOOTER")}
            disabled={savingScope != null}
            className="w-full sm:w-auto rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {savingFooter ? "Speichere…" : "Speichern"}
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Titel</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.footerTitle}
              onChange={(e) => updateSetting("footerTitle", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Untertitel</FieldLabel>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.footerSubtitle}
              onChange={(e) => updateSetting("footerSubtitle", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>E-Mail</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.footerEmail}
              onChange={(e) => updateSetting("footerEmail", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Telefon Recke</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.footerPhoneRecke}
              onChange={(e) => updateSetting("footerPhoneRecke", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Telefon Mettingen</FieldLabel>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.footerPhoneMettingen}
              onChange={(e) =>
                updateSetting("footerPhoneMettingen", e.target.value)
              }
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel
              hint="Mehrzeilig erlaubt (Straße + PLZ/Ort). Die Google-Maps-Verlinkung ändert sich nicht."
            >
              Adresse Recke
            </FieldLabel>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.footerAddressRecke}
              onChange={(e) =>
                updateSetting("footerAddressRecke", e.target.value)
              }
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel
              hint="Mehrzeilig erlaubt (Straße + PLZ/Ort). Die Google-Maps-Verlinkung ändert sich nicht."
            >
              Adresse Mettingen
            </FieldLabel>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={settings.footerAddressMettingen}
              onChange={(e) =>
                updateSetting("footerAddressMettingen", e.target.value)
              }
            />
          </div>
        </div>
      </SectionCard>
    </main>
  );
}
