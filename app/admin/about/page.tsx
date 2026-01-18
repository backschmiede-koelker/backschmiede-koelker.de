// app/admin/about/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import AboutView from "./about-view";
import { Metadata } from "next";
import type { AboutPersonDTO, AboutSectionDTO } from "./types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin - Über uns | Backschmiede Kölker",
  description: "Beschreibe hier die verschiedenen Abschnitte der 'Über uns'-Seite.",
  alternates: { canonical: "/admin/about" },
  openGraph: {
    title: "Admin - Über uns | Backschmiede Kölker",
    description: "Beschreibe hier die verschiedenen Abschnitte der 'Über uns'-Seite.",
    url: "/admin/about",
    type: "website",
  },
};

type SessionLike = { user?: { role?: string | null } | null } | null | undefined;

function mustBeAdmin(session: SessionLike) {
  if (session?.user?.role !== "ADMIN") redirect("/login");
}

/**
 * Sorgt dafür, dass es IMMER genau einen HERO gibt.
 * Idempotent: erstellt nur, wenn keiner existiert.
 */
async function ensureHero() {
  const existing = await getPrisma().aboutSection.findFirst({ where: { type: "HERO" } });
  if (existing) return;

  await getPrisma().aboutSection.create({
    data: {
      type: "HERO",
      slug: "hero",
      title: "Über uns",
      subtitle: null,
      body: null,
      imageUrl: null,
      isActive: true,
      sortOrder: -1000, // immer ganz oben
    },
  });
}

async function getData(): Promise<{
  sections: AboutSectionDTO[];
  people: AboutPersonDTO[];
}> {
  const [sections, people] = await Promise.all([
    getPrisma().aboutSection.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      include: {
        stats: { orderBy: { sortOrder: "asc" } },
        values: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
        gallery: { orderBy: { sortOrder: "asc" } },
      },
    }),
    getPrisma().aboutPerson.findMany({
      orderBy: [
        { sortOrder: "desc" },
        { name: "asc" },
        { id: "asc" },
      ],
    }),
  ]);

  return {
    sections: sections as AboutSectionDTO[],
    people: people as AboutPersonDTO[],
  };
}

export default async function AdminAboutPage() {
  const session = (await auth()) as SessionLike;
  mustBeAdmin(session);

  await ensureHero();
  const { sections, people } = await getData();

  return <AboutView initialSections={sections} initialPeople={people} />;
}
