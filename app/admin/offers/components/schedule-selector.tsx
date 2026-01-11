// app/admin/offers/components/schedule-selector.tsx
"use client";

import FieldLabel from "@/app/components/ui/field-label";
import SelectBox from "@/app/components/select-box";
import { WEEKDAY_OPTIONS } from "@/app/components/ui/weekdays";
import { OfferKind, Weekday } from "@/app/types/offers";

type Props = {
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
};

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
}: Props) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 min-w-0">
      {/* Auswahl Art: Zeitraum / Ein Tag / Wöchentlich */}
      <div className="lg:col-span-2 grid gap-2 lg:grid-cols-3 min-w-0">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="offer-kind"
            checked={kind === OfferKind.DATE_RANGE}
            onChange={() => onKindChange(OfferKind.DATE_RANGE)}
          />
          <span>Zeitraum</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="offer-kind"
            checked={kind === OfferKind.ONE_DAY}
            onChange={() => onKindChange(OfferKind.ONE_DAY)}
          />
          <span>Ein Tag</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="offer-kind"
            checked={kind === OfferKind.RECURRING_WEEKDAY}
            onChange={() => onKindChange(OfferKind.RECURRING_WEEKDAY)}
          />
          <span>Wöchentlich</span>
        </label>
      </div>

      {/* Felder je nach Art */}
      {kind === OfferKind.DATE_RANGE ? (
        <>
          <div className="min-w-0">
            <FieldLabel>Start</FieldLabel>
            <input
              type="date"
              className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <FieldLabel>Ende</FieldLabel>
            <input
              type="date"
              className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </>
      ) : kind === OfferKind.ONE_DAY ? (
        <>
          <div className="min-w-0">
            <FieldLabel>Datum</FieldLabel>
            <input
              type="date"
              className="mt-1 w-full min-w-0 max-w-full rounded-md border px-3 py-2 bg-white dark:bg-zinc-800"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
          <div aria-hidden />
        </>
      ) : (
        <>
          <div className="min-w-0">
            <FieldLabel>Wochentag</FieldLabel>
            <div className="mt-1 min-w-0">
              <SelectBox
                value={WEEKDAY_OPTIONS.find((w) => w.value === weekday)?.label || "Montag"}
                onChange={(label) => {
                  const found = WEEKDAY_OPTIONS.find((w) => w.label === label);
                  if (found) onWeekdayChange(found.value as Weekday);
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
