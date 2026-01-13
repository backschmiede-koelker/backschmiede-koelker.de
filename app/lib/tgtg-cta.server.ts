// app/lib/tgtg-cta.server.ts
import "server-only";
import { getPrisma } from "@/lib/prisma";

export type TgtgCtaDTO = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;

  reckeSubtitle: string | null;
  mettingenSubtitle: string | null;

  tgtgAppLinkRecke: string;
  tgtgAppLinkMettingen: string;

  reckeHinweis: string | null;
  mettingenHinweis: string | null;
  allgemeinerHinweis: string | null;

  // ✅ ids dazu
  steps: { id: string; sortOrder: number; title: string; description: string }[];
  faqItems: { id: string; sortOrder: number; question: string; answer: string }[];
};

const DEFAULTS: Omit<TgtgCtaDTO, "slug"> = {
  title: "Too Good To Go - Überraschungstüten",
  subtitle: null,
  description:
    "Spare und rette frische Backwaren vom Tag. Verfügbarkeit & Abholfenster findest du immer aktuell in der Too Good To Go App.",

  reckeSubtitle: "Überraschungstüte reservieren",
  mettingenSubtitle: "Überraschungstüte reservieren",

  tgtgAppLinkRecke: "https://share.toogoodtogo.com/item/142593183634493376/",
  tgtgAppLinkMettingen: "https://share.toogoodtogo.com/item/146056137368565632/",

  reckeHinweis: "Abholfenster & Verfügbarkeit: bitte in der App prüfen.",
  mettingenHinweis: "Abholfenster & Verfügbarkeit: bitte in der App prüfen.",
  allgemeinerHinweis:
    "Hinweis: Mengen sind begrenzt und variieren je Tag - in der App siehst du immer den aktuellen Stand.",

  // ids werden beim create automatisch erzeugt -> hier ohne id
  steps: [
    { id: "", sortOrder: 0, title: "Standort öffnen", description: "Auf Recke oder Mettingen klicken - du landest direkt beim passenden Eintrag in Too Good To Go." },
    { id: "", sortOrder: 1, title: "Tüte reservieren", description: "In der App auswählen & bezahlen - du erhältst eine Bestätigung." },
    { id: "", sortOrder: 2, title: "Zur Zeit abholen", description: "Abholfenster steht in der App - bitte rechtzeitig erscheinen und Bestätigung zeigen." },
    { id: "", sortOrder: 3, title: "Genießen & sparen", description: "Frische Backwaren zum kleinen Preis - und Lebensmittel gerettet!" },
  ],
  faqItems: [
    { id: "", sortOrder: 0, question: "Wo sehe ich Abholzeiten und Verfügbarkeit?", answer: "Direkt in der Too Good To Go App beim jeweiligen Standort - dort sind die Abholfenster und die Verfügbarkeit immer aktuell." },
    { id: "", sortOrder: 1, question: "Was steckt in der Überraschungstüte?", answer: "Eine gemischte Auswahl vom Tag (z. B. Brötchen, Brote, süßes Gebäck) - abhängig davon, was übrig ist." },
    { id: "", sortOrder: 2, question: "Kann ich mehrere Tüten reservieren?", answer: "Wenn genug verfügbar ist: ja. Die App zeigt die aktuelle Anzahl beim jeweiligen Standort." },
    { id: "", sortOrder: 3, question: "Was, wenn ich es nicht rechtzeitig schaffe?", answer: "Bitte plane genug Zeit ein - Abholung ist nur im in der App angegebenen Zeitfenster möglich." },
  ],
};

export async function ensureTgtgCta(): Promise<TgtgCtaDTO> {
  const prisma = getPrisma();

  const existing = await prisma.tgtgCta.findUnique({
    where: { slug: "default" },
    include: {
      steps: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      faqItems: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });

  if (existing) {
    return {
      slug: existing.slug,
      title: existing.title,
      subtitle: existing.subtitle ?? null,
      description: existing.description ?? null,

      reckeSubtitle: existing.reckeSubtitle ?? null,
      mettingenSubtitle: existing.mettingenSubtitle ?? null,

      tgtgAppLinkRecke: existing.tgtgAppLinkRecke,
      tgtgAppLinkMettingen: existing.tgtgAppLinkMettingen,

      reckeHinweis: existing.reckeHinweis ?? null,
      mettingenHinweis: existing.mettingenHinweis ?? null,
      allgemeinerHinweis: existing.allgemeinerHinweis ?? null,

      // ✅ ids zurückgeben (fix für key warning + Admin Einzel-Operationen)
      steps: existing.steps.map((s) => ({
        id: s.id,
        sortOrder: s.sortOrder,
        title: s.title,
        description: s.description,
      })),
      faqItems: existing.faqItems.map((f) => ({
        id: f.id,
        sortOrder: f.sortOrder,
        question: f.question,
        answer: f.answer,
      })),
    };
  }

  const created = await prisma.tgtgCta.create({
    data: {
      slug: "default",
      title: DEFAULTS.title,
      subtitle: DEFAULTS.subtitle,
      description: DEFAULTS.description,

      reckeSubtitle: DEFAULTS.reckeSubtitle,
      mettingenSubtitle: DEFAULTS.mettingenSubtitle,

      tgtgAppLinkRecke: DEFAULTS.tgtgAppLinkRecke,
      tgtgAppLinkMettingen: DEFAULTS.tgtgAppLinkMettingen,

      reckeHinweis: DEFAULTS.reckeHinweis,
      mettingenHinweis: DEFAULTS.mettingenHinweis,
      allgemeinerHinweis: DEFAULTS.allgemeinerHinweis,

      steps: {
        create: DEFAULTS.steps.map((s) => ({
          sortOrder: s.sortOrder,
          title: s.title,
          description: s.description,
        })),
      },
      faqItems: {
        create: DEFAULTS.faqItems.map((f) => ({
          sortOrder: f.sortOrder,
          question: f.question,
          answer: f.answer,
        })),
      },
    },
    include: {
      steps: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      faqItems: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });

  return {
    slug: created.slug,
    title: created.title,
    subtitle: created.subtitle ?? null,
    description: created.description ?? null,

    reckeSubtitle: created.reckeSubtitle ?? null,
    mettingenSubtitle: created.mettingenSubtitle ?? null,

    tgtgAppLinkRecke: created.tgtgAppLinkRecke,
    tgtgAppLinkMettingen: created.tgtgAppLinkMettingen,

    reckeHinweis: created.reckeHinweis ?? null,
    mettingenHinweis: created.mettingenHinweis ?? null,
    allgemeinerHinweis: created.allgemeinerHinweis ?? null,

    steps: created.steps.map((s) => ({
      id: s.id,
      sortOrder: s.sortOrder,
      title: s.title,
      description: s.description,
    })),
    faqItems: created.faqItems.map((f) => ({
      id: f.id,
      sortOrder: f.sortOrder,
      question: f.question,
      answer: f.answer,
    })),
  };
}
