// app/components/ui/weekdays.ts
import { Weekday } from "@/app/types/offers";

export const WEEKDAY_OPTIONS: { label: string; value: Weekday }[] = [
  { label: "Montag", value: Weekday.MONDAY },
  { label: "Dienstag", value: Weekday.TUESDAY },
  { label: "Mittwoch", value: Weekday.WEDNESDAY },
  { label: "Donnerstag", value: Weekday.THURSDAY },
  { label: "Freitag", value: Weekday.FRIDAY },
  { label: "Samstag", value: Weekday.SATURDAY },
  { label: "Sonntag", value: Weekday.SUNDAY },
];
