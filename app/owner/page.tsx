// =============================
// File: /app/owner/page.tsx
// Description: Komplett überarbeitete Owner-Seite mit vielen kleinen, wiederverwendbaren Komponenten.
// Theme: Tailwind + Emerald-Accent, dark-mode aware. Animations via framer-motion (optional).
// Dependencies (optional but nice): lucide-react, framer-motion
//   npm i lucide-react framer-motion
// =============================

import type { Metadata } from "next";
import OwnerHero from "../components/owner/owner-hero";
import OwnerStats from "../components/owner/owner-stats";
import OwnerStory from "../components/owner/owner-story";
import OwnerTimeline from "../components/owner/owner-timeline";
import OwnerGallery from "../components/owner/owner-gallery";
import OwnerValues from "../components/owner/owner-values";
import OwnerAwards from "../components/owner/owner-awards";
import OwnerCTA from "../components/owner/owner-cta";
import OwnerFAQ from "../components/owner/owner-faq";

export const metadata: Metadata = {
  title: "Über uns | Backschmiede Kölker",
  description:
    "Die Inhaberstory, Werte und Vision der Backschmiede Kölker mit Team, Tradition und Handwerk in Recke & Mettingen.",
  alternates: { canonical: "/owner" },
  openGraph: {
    title: "Über uns | Backschmiede Kölker",
    description:
      "Die Inhaberstory, Werte und Vision der Backschmiede Kölker mit Team, Tradition und Handwerk in Recke & Mettingen.",
    url: "/owner",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="space-y-16">
      <OwnerHero />
      <OwnerStats />
      <OwnerStory />
      <OwnerTimeline />
      <OwnerGallery />
      <OwnerValues />
      <OwnerAwards />
      <OwnerFAQ />
      <OwnerCTA />
    </div>
  );
}
