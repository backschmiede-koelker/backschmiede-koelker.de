// =============================
// File: /app/owner/page.tsx
// Description: Komplett überarbeitete Owner-Seite mit vielen kleinen, wiederverwendbaren Komponenten.
// Theme: Tailwind + Emerald-Accent, dark-mode aware. Animations via framer-motion (optional).
// Dependencies (optional but nice): lucide-react, framer-motion
//   npm i lucide-react framer-motion
// =============================

import OwnerHero from "../components/owner/owner-hero";
import OwnerStats from "../components/owner/owner-stats";
import OwnerStory from "../components/owner/owner-story";
import OwnerTimeline from "../components/owner/owner-timeline";
import OwnerGallery from "../components/owner/owner-gallery";
import OwnerValues from "../components/owner/owner-values";
import OwnerAwards from "../components/owner/owner-awards";
import OwnerCTA from "../components/owner/owner-cta";
import OwnerFAQ from "../components/owner/owner-faq";

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
