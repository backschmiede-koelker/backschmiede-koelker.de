import React from "react";
import { OfferKind, Weekday } from "@prisma/client";
import SelectBox from "@/app/components/select-box";
import FieldLabel from "@/app/components/ui/field-label";
import { WEEKDAY_OPTIONS } from "@/app/components/ui/weekdays";

export default function ScheduleSelector({
  kind,
  onKindChange,
  date,
  onDateChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  weekday,
  onWeekdayChange,
}: {
  kind: OfferKind;
  onKindChange: (k: OfferKind) => void;
  date: string;
  onDateChange: (v: string) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  weekday: Weekday;
  onWeekdayChange: (v: Weekday) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {/* Radiogruppe */}
      <div className="lg:col-span-2 grid gap-2 lg:grid-cols-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="kind"
            checked={kind === OfferKind.DATE_RANGE}
            onChange={() => onKindChange(OfferKind.DATE_RANGE)}
          />
          <span>
            Zeitraum <span className="text-xs text-zinc-500">(z. B. Mo–So)</span>
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="kind"
            checked={kind === OfferKind.ONE_DAY}
            onChange={() => onKindChange(OfferKind.ONE_DAY)}
          />
          <span>Ein Tag</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="kind"
            checked={kind === OfferKind.RECURRING_WEEKDAY}
            onChange={() => onKindChange(OfferKind.RECURRING_WEEKDAY)}
          />
          <span>Wöchentlich</span>
        </label>
      </div>

      {/* Datums-/Wochentagsfelder */}
      {kind === OfferKind.DATE_RANGE ? (
        <>
          <div className="min-w-0">
            <FieldLabel hint="Erster Gültigkeitstag des Angebots.">Start</FieldLabel>
            <input
              className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <FieldLabel hint="Letzter Gültigkeitstag des Angebots.">Ende</FieldLabel>
            <input
              className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </>
      ) : kind === OfferKind.ONE_DAY ? (
        <>
          <div className="min-w-0">
            <FieldLabel hint="Nur für einen bestimmten Tag gültig.">Datum</FieldLabel>
            <input
              className="mt-1 w-full min-w-0 rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
          <div aria-hidden />
        </>
      ) : (
        <>
          <div className="min-w-0">
            <FieldLabel hint="An welchem Wochentag soll dieses Angebot jede Woche gelten?">
              Wochentag
            </FieldLabel>
            <div className="mt-1">
              <SelectBox
                ariaLabel="Wochentag wählen"
                value={WEEKDAY_OPTIONS.find((w) => w.value === weekday)?.label || "Montag"}
                onChange={(label) => {
                  const found = WEEKDAY_OPTIONS.find((w) => w.label === label);
                  if (found) onWeekdayChange(found.value);
                }}
                options={WEEKDAY_OPTIONS.map((w) => w.label)}
                className="w-full min-w-0"
              />
            </div>
          </div>
          <div aria-hidden />
        </>
      )}
    </div>
  );
}
