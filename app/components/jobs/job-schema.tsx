// /app/components/jobs/job-schema.tsx
import type { Job } from "../../lib/jobs/types";

export function buildJobPostingJsonLd(job: Job) {
  const base = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.descriptionHtml,
    datePosted: job.datePosted.toISOString(),
    validThrough: job.validThrough?.toISOString(),
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: "Bäckerei Muster",
      sameAs: "https://www.example.com",
      logo: "https://www.example.com/logo.png",
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
    baseSalary: job.salary
      ? {
          "@type": "MonetaryAmount",
          currency: job.salary.currency,
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salary.min,
            maxValue: job.salary.max,
            unitText: job.salary.unitText,
          },
        }
      : undefined,
    directApply: true,
    identifier: {
      "@type": "PropertyValue",
      name: "Bäckerei Muster",
      value: job.id,
    },
  } as const;

  return base;
}

export function buildJobsListJsonLd(jobs: Job[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: jobs.map((j, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `https://www.example.com/jobs/${j.slug}`,
      item: buildJobPostingJsonLd(j),
    })),
  };
}
