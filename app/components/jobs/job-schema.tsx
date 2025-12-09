// app/components/jobs/job-schema.tsx
import type { Job } from "../../lib/jobs/types";

function baseUrl() {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://www.example.com").replace(
    /\/+$/,
    ""
  );
}

export function buildJobPostingJsonLd(job: Job) {
  const origin = baseUrl();

  const payload: any = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.descriptionHtml,
    datePosted: job.datePosted.toISOString(),
    validThrough: job.validThrough?.toISOString(),
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: "Backschmiede Kölker",
      sameAs: origin,
      logo: `${origin}/logo.png`, 
    },
    jobLocation: job.locations.map((l) => ({
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: l,
        addressCountry: "DE",
      },
    })),
    applicantLocationRequirements: {
      "@type": "Country",
      name: "DE",
    },
    directApply: true,
    identifier: {
      "@type": "PropertyValue",
      name: "Backschmiede Kölker",
      value: job.id,
    },
    url: `${origin}/jobs/${job.slug}`,
  };

  if (job.startsAt) {
    payload.jobStartDate = job.startsAt.toISOString();
  }

  if (job.salary) {
    payload.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salary.currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary.min,
        maxValue: job.salary.max,
        unitText: job.salary.unitText,
      },
    };
  }

  return payload;
}

export function buildJobsListJsonLd(jobs: Job[]) {
  const origin = baseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: jobs.map((j, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${origin}/jobs/${j.slug}`,
      item: buildJobPostingJsonLd(j),
    })),
  };
}
