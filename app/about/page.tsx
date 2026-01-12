// app/about/page.tsx
import type { Metadata } from "next";
import AboutSectionRenderer from "@/app/components/about/section-renderer";
import type { AboutApiResponse, AboutPersonDTO, AboutSectionDTO } from "./types";

export const metadata: Metadata = {
  title: "Über uns | Backschmiede Kölker",
  description:
    "Lerne die Backschmiede Kölker kennen: Menschen, Handwerk, Philosophie und Team in Recke & Mettingen.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Über uns | Backschmiede Kölker",
    description:
      "Lerne die Backschmiede Kölker kennen: Menschen, Handwerk, Philosophie und Team in Recke & Mettingen.",
    url: "/about",
    type: "website",
  },
};

async function getAbout(): Promise<{ sections: AboutSectionDTO[]; persons: AboutPersonDTO[] }> {
  const res = await fetch(`${process.env.AUTH_URL ?? ""}/api/about`, {
    cache: "no-store",
  });

  if (!res.ok) return { sections: [], persons: [] };

  const data = (await res.json()) as AboutApiResponse;
  return { sections: data.sections ?? [], persons: data.people ?? [] };
}

export default async function AboutPage() {
  const { sections, persons } = await getAbout();

  const hero = sections.find((s) => s.type === "HERO") ?? null;
  const rest = sections.filter((s) => s.type !== "HERO");

  return (
    <div className="space-y-12 md:space-y-16">
      {hero && <AboutSectionRenderer key={hero.id} section={hero} persons={persons} />}
      {rest.map((section) => (
        <AboutSectionRenderer key={section.id} section={section} persons={persons} />
      ))}
    </div>
  );
}
