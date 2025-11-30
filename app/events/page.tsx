// /app/events/page.tsx

export default function Page() {
  return (
    <div>
      <h1>Im Aufbau</h1>
    </div>
  );
}

/*
import type { Metadata } from "next";
import { InViewReveal, StaggerContainer, StaggerItem } from "../components/animations";
import FeaturedHero from "../components/events/featured-hero";
import EventFilters from "../components/events/event-filters";
import EventList from "../components/events/event-list";
import MonthGrid from "../components/events/month-grid";
import Timeline from "../components/events/timeline";
import VenueMap from "../components/events/venue-map";
import Faq from "../components/events/faq";
import CalendarSubscribeCta from "../components/events/calendar-subscribe-cta";
import NewsletterCta from "../components/events/newsletter-cta";
import RsvpForm from "../components/events/rsvp-form";

export const metadata: Metadata = {
  title: "Events & Termine | Backschmiede Kölker",
  description:
    "Alle aktuellen Workshops, Backkurse und Community-Events der Backschmiede Kölker in Recke & Mettingen auf einen Blick.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Events & Termine | Backschmiede Kölker",
    description:
      "Alle aktuellen Workshops, Backkurse und Community-Events der Backschmiede Kölker in Recke & Mettingen auf einen Blick.",
    url: "/events",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="space-y-8">
      <FeaturedHero />

      <InViewReveal className="space-y-6">
        <EventFilters />
      </InViewReveal>

      <StaggerContainer className="space-y-8">
        <StaggerItem>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">Nächste Termine</h2>
            <EventList />
          </section>
        </StaggerItem>

        <StaggerItem>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">Kalender-Übersicht</h2>
            <MonthGrid />
          </section>
        </StaggerItem>

        <StaggerItem>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">Zeitstrahl</h2>
            <Timeline />
          </section>
        </StaggerItem>

        <StaggerItem>
          <CalendarSubscribeCta />
        </StaggerItem>

        <StaggerItem>
          <VenueMap />
        </StaggerItem>

        <StaggerItem>
          <RsvpForm />
        </StaggerItem>

        <StaggerItem>
          <Faq />
        </StaggerItem>

        <StaggerItem>
          <NewsletterCta />
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
*/