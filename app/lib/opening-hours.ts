export type WeekdayKey =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type TimeInterval = { start: string; end: string };

export const WEEKDAY_ORDER: WeekdayKey[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  MONDAY: "Montag",
  TUESDAY: "Dienstag",
  WEDNESDAY: "Mittwoch",
  THURSDAY: "Donnerstag",
  FRIDAY: "Freitag",
  SATURDAY: "Samstag",
  SUNDAY: "Sonntag",
};

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(value: string): boolean {
  return TIME_RE.test(value.trim());
}

export function normalizeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  const cleaned = intervals
    .map((interval) => ({
      start: interval.start.trim(),
      end: interval.end.trim(),
    }))
    .filter((interval) => interval.start && interval.end);

  return cleaned.sort((a, b) => a.start.localeCompare(b.start));
}

export function intervalsToLine(weekday: WeekdayKey, intervals: TimeInterval[]): string {
  const label = WEEKDAY_LABELS[weekday];
  if (!intervals.length) return `${label}: geschlossen`;
  const times = intervals.map((i) => `${i.start}-${i.end} Uhr`).join(", ");
  return `${label}: ${times}`;
}

export function normalizeDateToUtc(dateStr: string): Date | null {
  const [y, m, d] = dateStr.split("-").map((n) => Number(n));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

export function dateToYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayLocalYmd(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
