import type { Metadata } from "next";

import AdminOffersView from "./offers-view";

export const metadata: Metadata = {
  title: "Admin - Angebote | Backschmiede Kölker",
  description: "Tages- und Wochenangebote, Aktionen und Filialprioritäten zentral planen und steuern.",
  alternates: { canonical: "/admin/offers" },
  openGraph: {
    title: "Admin - Angebote | Backschmiede Kölker",
    description: "Tages- und Wochenangebote, Aktionen und Filialprioritäten zentral planen und steuern.",
    url: "/admin/offers",
    type: "website",
  },
};

export default function AdminOffersPage() {
  return <AdminOffersView />;
}
