// app/components/about/section-renderer.tsx
import type { AboutPersonDTO, AboutSectionDTO } from "@/app/about/types";

import AboutHeroSection from "./sections/hero-section";
import AboutStatsSection from "./sections/stats-section";
import AboutTextSection from "./sections/text-section";
import AboutValuesSection from "./sections/values-section";
import AboutTimelineSection from "./sections/timeline-section";
import AboutPeopleSection from "./sections/people-section";
import AboutGallerySection from "./sections/gallery-section";
import AboutFaqSection from "./sections/faq-section";
import AboutCtaSection from "./sections/cta-section";

type Props = {
  section: AboutSectionDTO;
  persons: AboutPersonDTO[];
};

export default function AboutSectionRenderer({ section, persons }: Props) {
  switch (section.type) {
    case "HERO":
      return <AboutHeroSection section={section} persons={persons} />;
    case "STATS":
      return <AboutStatsSection section={section} />;
    case "CUSTOM_TEXT":
      return <AboutTextSection section={section} />;
    case "VALUES":
      return <AboutValuesSection section={section} />;
    case "TIMELINE":
      return <AboutTimelineSection section={section} />;
    case "TEAM":
      return <AboutPeopleSection section={section} persons={persons} />;
    case "GALLERY":
      return <AboutGallerySection section={section} />;
    case "FAQ":
      return <AboutFaqSection section={section} />;
    case "CTA":
      return <AboutCtaSection section={section} />;
    default:
      return null;
  }
}
