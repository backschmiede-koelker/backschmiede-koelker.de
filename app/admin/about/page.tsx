// app/admin/about/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AboutView from "./about-view";
import { Metadata } from "next";

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
  const existing = await prisma.aboutSection.findFirst({ where: { type: "HERO" as any } });
  if (existing) return;

  await prisma.aboutSection.create({
    data: {
      type: "HERO" as any,
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

async function getData() {
  const [sections, people] = await Promise.all([
    prisma.aboutSection.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      include: {
        stats: { orderBy: { sortOrder: "asc" } },
        values: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
        gallery: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.aboutPerson.findMany({
      orderBy: [
        { sortOrder: "desc" },
        { name: "asc" },
        { id: "asc" },
      ],
    }),
  ]);

  return { sections, people };
}

export default async function AdminAboutPage() {
  const session = (await auth()) as SessionLike;
  mustBeAdmin(session);

  await ensureHero();
  const { sections, people } = await getData();

  return <AboutView initialSections={sections as any} initialPeople={people as any} />;
}
