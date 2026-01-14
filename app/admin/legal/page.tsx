// app/admin/legal/page.tsx
import type { Metadata } from "next";
import AdminLegalView from "./legal-view";
import { getOrCreateLegal, getOrCreateLegalSettings } from "@/app/lib/legal.server";

export const metadata: Metadata = {
  title: "Admin - Rechtliches | Backschmiede Kölker",
  description: "Impressum und Datenschutzerklärung verwalten.",
  alternates: { canonical: "/admin/legal" },
  openGraph: {
    title: "Admin - Rechtliches | Backschmiede Kölker",
    description: "Impressum und Datenschutzerklärung verwalten.",
    url: "/admin/legal",
    type: "website",
  },
};

export default async function AdminLegalPage() {
  const [settings, imprint, privacy] = await Promise.all([
    getOrCreateLegalSettings(),
    getOrCreateLegal("IMPRINT"),
    getOrCreateLegal("PRIVACY"),
  ]);

  return (
    <AdminLegalView
      initialSettings={settings}
      initialImprint={imprint}
      initialPrivacy={privacy}
    />
  );
}
