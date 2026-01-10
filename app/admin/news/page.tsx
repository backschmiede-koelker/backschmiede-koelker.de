import type { Metadata } from "next";

import AdminNewsView from "./news-view";

export const metadata: Metadata = {
  title: "Admin - News | Backschmiede Kölker",
  description: "News, Tags und CTAs für die Backschmiede Kölker schnell erfassen und bearbeiten.",
  alternates: { canonical: "/admin/news" },
  openGraph: {
    title: "Admin - News | Backschmiede Kölker",
    description: "News, Tags und CTAs für die Backschmiede Kölker schnell erfassen und bearbeiten.",
    url: "/admin/news",
    type: "website",
  },
};

export default function AdminNewsPage() {
  return <AdminNewsView />;
}
