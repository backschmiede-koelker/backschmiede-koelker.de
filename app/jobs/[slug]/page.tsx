// app/jobs/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getJobBySlug } from "@/app/lib/jobs/db";
import { JobDetail } from "@/app/components/jobs/job-detail";
import { buildJobPostingJsonLd } from "@/app/components/jobs/job-schema";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);
  if (!job) {
    return { title: "Stellenangebot", description: "Jobdetails" };
  }
  return {
    title: `${job.title} | Backschmiede Kölker`,
    description: job.teaser,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      title: job.title,
      description: job.teaser,
      type: "article",
      url: `/jobs/${job.slug}`,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const job = await getJobBySlug(params.slug);
  if (!job) return notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJobPostingJsonLd(job)),
        }}
      />
      <JobDetail job={job} />
    </>
  );
}
