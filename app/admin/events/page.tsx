// app/admin/events/page.tsx
import type { Metadata } from "next";
import AdminEventsView from "./events-view";

export const metadata: Metadata = {
  title: "Admin - Veranstaltungen | Backschmiede Kölker",
  description: "Events & Termine verwalten - Bilder, Datum, Beschreibung und Aktiv-Status.",
  alternates: { canonical: "/admin/events" },
  openGraph: {
    title: "Admin - Veranstaltungen | Backschmiede Kölker",
    description: "Events & Termine verwalten - Bilder, Datum, Beschreibung und Aktiv-Status.",
    url: "/admin/events",
    type: "website",
  },
};

export default function AdminEventsPage() {
  return <AdminEventsView />;
}
