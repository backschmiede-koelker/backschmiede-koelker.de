// app/components/tgtg-cta.server.tsx
import TgtgCta from "./tgtg-cta";
import { ensureTgtgCta } from "@/app/lib/tgtg-cta.server";

export default async function TgtgCtaServer() {
  const dto = await ensureTgtgCta();
  return (
    <TgtgCta
      content={{
        title: dto.title,
        subtitle: dto.subtitle,
        description: dto.description,
        reckeSubtitle: dto.reckeSubtitle,
        mettingenSubtitle: dto.mettingenSubtitle,
        tgtgAppLinkRecke: dto.tgtgAppLinkRecke,
        tgtgAppLinkMettingen: dto.tgtgAppLinkMettingen,
        reckeHinweis: dto.reckeHinweis,
        mettingenHinweis: dto.mettingenHinweis,
        allgemeinerHinweis: dto.allgemeinerHinweis,
        steps: dto.steps.map((s) => ({ title: s.title, description: s.description })),
        faqItems: dto.faqItems.map((f) => ({ question: f.question, answer: f.answer })),
      }}
    />
  );
}
