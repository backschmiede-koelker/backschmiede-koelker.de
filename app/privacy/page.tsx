// /app/privacy/page.tsx
import type { Metadata } from "next";
import LegalDocument from "../components/legal-document";
import { getOrCreateLegal, getOrCreateLegalSettings } from "../lib/legal.server";
import { fallbackLegalDocument, fallbackLegalSettings } from "../lib/legal-fallback";

export const metadata: Metadata = {
  title: "Datenschutz | Backschmiede Kölker",
  description: "Datenschutzerklärung der Backschmiede Kölker.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Datenschutz | Backschmiede Kölker",
    description: "Datenschutzerklärung der Backschmiede Kölker.",
    url: "/privacy",
    type: "website",
  },
};

export default async function PrivacyPage() {
  const document = await getOrCreateLegal("PRIVACY").catch(() =>
    fallbackLegalDocument("PRIVACY"),
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
