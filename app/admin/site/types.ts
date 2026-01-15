// app/admin/site/types.ts
import type { LocationKey } from "@/app/lib/locations";
import type { TimeInterval, WeekdayKey } from "@/app/lib/opening-hours";

export type SiteSettingsForm = {
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  heroTag1: string;
  heroTag2: string;
  heroTag3: string;
  heroImageMettingen: string;
  heroImageRecke: string;
  subtitleNews: string | null;
  subtitleOffers: string | null;
  subtitleHours: string | null;
  footerTitle: string;
  footerSubtitle: string;
  footerEmail: string;
  footerAddressRecke: string;
  footerAddressMettingen: string;
  footerPhoneRecke: string;
  footerPhoneMettingen: string;
};

export type WeeklyHoursForm = {
  weekday: WeekdayKey;
  intervals: TimeInterval[];
};

export type ExceptionForm = {
  id?: string;
  location?: LocationKey;
  date: string;
  closed: boolean;
  intervals: TimeInterval[];
  note?: string | null;
};

export type HoursPayload = Record<LocationKey, WeeklyHoursForm[]>;
export type ExceptionsPayload = Record<LocationKey, ExceptionForm[]>;
