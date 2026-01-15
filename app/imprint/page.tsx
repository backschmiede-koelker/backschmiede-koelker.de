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

export default async function ImpressumPage() {
  const document = await getOrCreateLegal("IMPRINT").catch(() =>
    fallbackLegalDocument("IMPRINT"),
  );
  const settings = await getOrCreateLegalSettings().catch(() =>
    fallbackLegalSettings(),
  );

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
