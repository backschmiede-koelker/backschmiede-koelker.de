// app/admin/site/page.tsx
import type { Metadata } from "next";
import AdminSiteView from "./site-view";
import { getOrCreateSiteSettings } from "@/app/lib/site-settings.server";
import { getWeeklyHours, listExceptions } from "@/app/lib/opening-hours.server";
import type { ExceptionsPayload, HoursPayload, SiteSettingsForm } from "./types";

export const metadata: Metadata = {
  title: "Admin - Startseite | Backschmiede Kölker",
  description: "Hero, Öffnungszeiten und Footer der Startseite bearbeiten.",
  alternates: { canonical: "/admin/site" },
  openGraph: {
    title: "Admin - Startseite | Backschmiede Kölker",
    description: "Hero, Öffnungszeiten und Footer der Startseite bearbeiten.",
    url: "/admin/site",
    type: "website",
  },
};

export default async function AdminSitePage() {
  const [settings, weeklyMettingen, weeklyRecke, exceptionsMettingen, exceptionsRecke] =
    await Promise.all([
      getOrCreateSiteSettings(),
      getWeeklyHours("METTINGEN"),
      getWeeklyHours("RECKE"),
      listExceptions("METTINGEN"),
      listExceptions("RECKE"),
    ]);

  const initialSettings: SiteSettingsForm = {
    heroBadge: settings.heroBadge,
    heroTitleLine1: settings.heroTitleLine1,
    heroTitleLine2: settings.heroTitleLine2,
    heroDescription: settings.heroDescription,
    heroTag1: settings.heroTag1,
    heroTag2: settings.heroTag2,
    heroTag3: settings.heroTag3,
    heroImageMettingen: settings.heroImageMettingen,
    heroImageRecke: settings.heroImageRecke,
    subtitleNews: settings.subtitleNews,
    subtitleOffers: settings.subtitleOffers,
    subtitleHours: settings.subtitleHours,
    footerTitle: settings.footerTitle,
    footerSubtitle: settings.footerSubtitle,
    footerEmail: settings.footerEmail,
    footerAddressRecke: settings.footerAddressRecke,
    footerAddressMettingen: settings.footerAddressMettingen,
    footerPhoneRecke: settings.footerPhoneRecke,
    footerPhoneMettingen: settings.footerPhoneMettingen,
  };

  const initialWeeklyHours: HoursPayload = {
    METTINGEN: weeklyMettingen,
    RECKE: weeklyRecke,
  };

  const initialExceptions: ExceptionsPayload = {
    METTINGEN: exceptionsMettingen,
    RECKE: exceptionsRecke,
  };

  return (
    <AdminSiteView
      initialSettings={initialSettings}
      initialWeeklyHours={initialWeeklyHours}
      initialExceptions={initialExceptions}
    />
  );
}
