import "server-only";

import { getPrisma } from "@/lib/prisma";

export type SiteSettingsDTO = {
  id: string;
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

export type SiteSettingsInput = Omit<SiteSettingsDTO, "id">;

export const DEFAULT_SITE_SETTINGS: SiteSettingsInput = {
  heroBadge: "Frisch gebacken in Mettingen & Recke",
  heroTitleLine1: "Backschmiede Kölker",
  heroTitleLine2: "Handwerk. Zeit. Gute Zutaten.",
  heroDescription:
    "Brote, Brötchen und Kuchen mit langer Teigführung, eigenem Sauerteig und viel Liebe. Komm vorbei - wir freuen uns auf dich!",
  heroTag1: "Eigener Sauerteig",
  heroTag2: "Regional & ehrlich",
  heroTag3: "Mit Liebe gebacken",
  heroImageMettingen: "/mettingen-draussen-alt.png",
  heroImageRecke: "/recke-tuer-ballons.jpg",
  subtitleNews: null,
  subtitleOffers:
    "Hier findest du unsere aktuellen Spezialpreise und Aktionen - heute und für die nächsten Tage.",
  subtitleHours: null,
  footerTitle: "Backschmiede Kölker",
  footerSubtitle:
    "Handwerkliche Backwaren aus Mettingen & Recke - täglich frisch, mit Zeit, Herz und guten Zutaten.",
  footerEmail: "info@backschmiede-koelker.de",
  footerAddressRecke: "Hauptstraße 10\n49509 Recke",
  footerAddressMettingen: "Landrat-Schultz-Straße 1\n49497 Mettingen",
  footerPhoneRecke: "+49 1575 5353999",
  footerPhoneMettingen: "+49 5452 919611",
};

function cleanRequired(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} darf nicht leer sein.`);
  }
  return trimmed;
}

function cleanOptional(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : null;
}

export async function getOrCreateSiteSettings(): Promise<SiteSettingsDTO> {
  const prisma = getPrisma();
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (existing) {
    return {
      id: existing.id,
      heroBadge: existing.heroBadge,
      heroTitleLine1: existing.heroTitleLine1,
      heroTitleLine2: existing.heroTitleLine2,
      heroDescription: existing.heroDescription,
      heroTag1: existing.heroTag1,
      heroTag2: existing.heroTag2,
      heroTag3: existing.heroTag3,
      heroImageMettingen: existing.heroImageMettingen,
      heroImageRecke: existing.heroImageRecke,
      subtitleNews: existing.subtitleNews ?? null,
      subtitleOffers: existing.subtitleOffers ?? null,
      subtitleHours: existing.subtitleHours ?? null,
      footerTitle: existing.footerTitle,
      footerSubtitle: existing.footerSubtitle,
      footerEmail: existing.footerEmail,
      footerAddressRecke: existing.footerAddressRecke,
      footerAddressMettingen: existing.footerAddressMettingen,
      footerPhoneRecke: existing.footerPhoneRecke,
      footerPhoneMettingen: existing.footerPhoneMettingen,
    };
  }

  const created = await prisma.siteSettings.create({
    data: {
      id: "singleton",
      ...DEFAULT_SITE_SETTINGS,
    },
  });

  return {
    id: created.id,
    heroBadge: created.heroBadge,
    heroTitleLine1: created.heroTitleLine1,
    heroTitleLine2: created.heroTitleLine2,
    heroDescription: created.heroDescription,
    heroTag1: created.heroTag1,
    heroTag2: created.heroTag2,
    heroTag3: created.heroTag3,
    heroImageMettingen: created.heroImageMettingen,
    heroImageRecke: created.heroImageRecke,
    subtitleNews: created.subtitleNews ?? null,
    subtitleOffers: created.subtitleOffers ?? null,
    subtitleHours: created.subtitleHours ?? null,
    footerTitle: created.footerTitle,
    footerSubtitle: created.footerSubtitle,
    footerEmail: created.footerEmail,
    footerAddressRecke: created.footerAddressRecke,
    footerAddressMettingen: created.footerAddressMettingen,
    footerPhoneRecke: created.footerPhoneRecke,
    footerPhoneMettingen: created.footerPhoneMettingen,
  };
}

export async function updateSiteSettings(input: SiteSettingsInput): Promise<SiteSettingsDTO> {
  await getOrCreateSiteSettings();
  const prisma = getPrisma();

  const updated = await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: {
      heroBadge: cleanRequired(input.heroBadge, "Hero-Badge"),
      heroTitleLine1: cleanRequired(input.heroTitleLine1, "Hero Titel (Zeile 1)"),
      heroTitleLine2: cleanRequired(input.heroTitleLine2, "Hero Titel (Zeile 2)"),
      heroDescription: cleanRequired(input.heroDescription, "Hero Beschreibung"),
      heroTag1: cleanRequired(input.heroTag1, "Hero Tag 1"),
      heroTag2: cleanRequired(input.heroTag2, "Hero Tag 2"),
      heroTag3: cleanRequired(input.heroTag3, "Hero Tag 3"),
      heroImageMettingen: cleanRequired(input.heroImageMettingen, "Hero Bild Mettingen"),
      heroImageRecke: cleanRequired(input.heroImageRecke, "Hero Bild Recke"),
      subtitleNews: cleanOptional(input.subtitleNews),
      subtitleOffers: cleanOptional(input.subtitleOffers),
      subtitleHours: cleanOptional(input.subtitleHours),
      footerTitle: cleanRequired(input.footerTitle, "Footer Titel"),
      footerSubtitle: cleanRequired(input.footerSubtitle, "Footer Untertitel"),
      footerEmail: cleanRequired(input.footerEmail, "Footer E-Mail"),
      footerAddressRecke: cleanRequired(input.footerAddressRecke, "Adresse Recke"),
      footerAddressMettingen: cleanRequired(input.footerAddressMettingen, "Adresse Mettingen"),
      footerPhoneRecke: cleanRequired(input.footerPhoneRecke, "Telefon Recke"),
      footerPhoneMettingen: cleanRequired(input.footerPhoneMettingen, "Telefon Mettingen"),
    },
  });

  return {
    id: updated.id,
    heroBadge: updated.heroBadge,
    heroTitleLine1: updated.heroTitleLine1,
    heroTitleLine2: updated.heroTitleLine2,
    heroDescription: updated.heroDescription,
    heroTag1: updated.heroTag1,
    heroTag2: updated.heroTag2,
    heroTag3: updated.heroTag3,
    heroImageMettingen: updated.heroImageMettingen,
    heroImageRecke: updated.heroImageRecke,
    subtitleNews: updated.subtitleNews ?? null,
    subtitleOffers: updated.subtitleOffers ?? null,
    subtitleHours: updated.subtitleHours ?? null,
    footerTitle: updated.footerTitle,
    footerSubtitle: updated.footerSubtitle,
    footerEmail: updated.footerEmail,
    footerAddressRecke: updated.footerAddressRecke,
    footerAddressMettingen: updated.footerAddressMettingen,
    footerPhoneRecke: updated.footerPhoneRecke,
    footerPhoneMettingen: updated.footerPhoneMettingen,
  };
}
