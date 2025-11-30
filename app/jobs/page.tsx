// /app/jobs/page.tsx
import { Metadata } from "next";
import { JobHero } from "@/app/components/jobs/job-hero";
import { JobFilters } from "@/app/components/jobs/job-filters";
import { JobList } from "@/app/components/jobs/job-list";
import { fetchJobs } from "../lib/jobs/data";
import { buildJobsListJsonLd } from "@/app/components/jobs/job-schema";

export const metadata: Metadata = {
  title: "Stellenangebote | Backschmiede Kölker",
  description:
    "Jobs in Verkauf, Backstube und Logistik - mit fairer Bezahlung, Teamspirit und Benefits. Jetzt bewerben!",
  alternates: { canonical: "/jobs" },
  openGraph: {
    title: "Stellenangebote | Backschmiede Kölker",
    description:
      "Aktuelle Jobs: Bäcker/in, Verkäufer/in, Aushilfe, Ausbildung. Bewirb dich jetzt!",
    url: "/jobs",
    type: "website",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const q = (searchParams?.q as string) || "";
  const loc = (searchParams?.loc as string) || "";
  const role = (searchParams?.role as string) || "";
  const jobs = await fetchJobs({ q, loc, role });

  return (
    <div className="space-y-8">
      <JobHero />
      {/* JSON-LD für Job-Suchmaschinen (Liste) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJobsListJsonLd(jobs)),
        }}
      />
      <div className="mx-auto max-w-6xl px-3 md:px-4">
        {/* Filter bewusst UNTER dem Header (Header hat z-50) */}
        <div className="relative z-40">
          <JobFilters />
        </div>

        {/* Jobliste darunter */}
        <div className="relative z-10">
          <JobList jobs={jobs} />
        </div>
      </div>
    </div>
  );
}
