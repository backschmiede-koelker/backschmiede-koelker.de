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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PrivacyPage() {
  const document = await getOrCreateLegal("PRIVACY").catch((e) => {
    console.error("[privacy] getOrCreateLegal failed", e);
    return fallbackLegalDocument("PRIVACY");
  });

  console.log("[privacy page] doc", {
    id: document.id,
    firstBlockId: document.sections?.[0]?.blocks?.[0]?.id,
    firstBlockText: document.sections?.[0]?.blocks?.[0]?.text,
  });

  const settings = await getOrCreateLegalSettings().catch((e) => {
    console.error("[privacy] getOrCreateLegalSettings failed", e);
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
