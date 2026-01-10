// app/admin/products/page.tsx
import type { Metadata } from "next";

import AdminProductsView from "./products-view";

export const metadata: Metadata = {
  title: "Admin - Produkte | Backschmiede Kölker",
  description: "Produkte, Preise, Einheiten und Tags direkt im Admin-Panel pflegen.",
  alternates: { canonical: "/admin/products" },
  openGraph: {
    title: "Admin - Produkte | Backschmiede Kölker",
    description: "Produkte, Preise, Einheiten und Tags direkt im Admin-Panel pflegen.",
    url: "/admin/products",
    type: "website",
  },
};

export default function AdminProductsPage() {
  return <AdminProductsView />;
}
