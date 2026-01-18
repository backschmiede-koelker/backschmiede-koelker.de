// /app/imprint/page.tsx
import type { Metadata } from "next";
import LegalDocument from "../components/legal-document";
import { getOrCreateLegal, getOrCreateLegalSettings } from "../lib/legal.server";
import { fallbackLegalDocument, fallbackLegalSettings } from "../lib/legal-fallback";

export const metadata: Metadata = {
  title: "Impressum | Backschmiede Kölker",
  description: "Impressum der Backschmiede Kölker mit Anbieterkennzeichnung und Kontakt.",
  alternates: { canonical: "/imprint" },
  openGraph: {
    title: "Impressum | Backschmiede Kölker",
    description: "Impressum der Backschmiede Kölker mit Anbieterkennzeichnung und Kontakt.",
    url: "/imprint",
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ImpressumPage() {
  const document = await getOrCreateLegal("IMPRINT").catch((e) => {
    console.error("[imprint] getOrCreateLegal failed", e);
    return fallbackLegalDocument("IMPRINT");
  });

  console.log("[imprint page] doc", {
    id: document.id,
    firstBlockId: document.sections?.[0]?.blocks?.[0]?.id,
    firstBlockText: document.sections?.[0]?.blocks?.[0]?.text,
  });

  const settings = await getOrCreateLegalSettings().catch((e) => {
    console.error("[imprint] getOrCreateLegalSettings failed", e);
    return fallbackLegalSettings();
  });

  return (
    <main
      className={[
        "mx-auto w-full max-w-3xl px-4 py-10",
        "prose prose-zinc dark:prose-invert",
        "min-w-0 break-words",
        "prose-a:break-words",
      ].join(" ")}
    >
      <LegalDocument document={document} settings={settings} />
    </main>
  );
}
