// app/admin/jobs/page.tsx
import type { Metadata } from "next";
import JobsView from "./jobs-view";

export const metadata: Metadata = {
  title: "Admin - Jobs | Backschmiede Kölker",
  description: "Stellenanzeigen erstellen, bearbeiten und verwalten.",
  alternates: { canonical: "/admin/jobs" },
  openGraph: {
    title: "Admin - Jobs | Backschmiede Kölker",
    description: "Stellenanzeigen erstellen, bearbeiten und verwalten.",
    url: "/admin/jobs",
    type: "website",
  },
};

export default function AdminJobsPage() {
  return <JobsView />;
}
