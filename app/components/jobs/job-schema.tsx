// app/components/jobs/job-schema.tsx
import type { Job } from "@/app/lib/jobs/types";

function baseUrl() {
  const env = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  return env || "https://backschmiede-koelker.de";
}

function employmentToSchema(t: Job["employmentTypes"][number]) {
  return t;
}

function locationName(l: Job["locations"][number]) {
  return l === "METTINGEN" ? "Mettingen" : "Recke";
}

export function buildJobPostingJsonLd(job: Job) {
  const url = `${baseUrl()}/jobs/${job.slug}`;

  const salary =
    (job.salaryMinCents || job.salaryMaxCents)
      ? {
          "@type": "MonetaryAmount",
          currency: "EUR",
          value: {
            "@type": "QuantitativeValue",
            ...(job.salaryMinCents ? { minValue: job.salaryMinCents / 100 } : {}),
            ...(job.salaryMaxCents ? { maxValue: job.salaryMaxCents / 100 } : {}),
            unitText: job.salaryUnit || "MONTH",
          },
        }
      : undefined;

  const locations =
    job.locations.length
      ? job.locations.map((l) => ({
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: locationName(l),
            addressCountry: "DE",
          },
        }))
      : [
          {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Mettingen",
              addressCountry: "DE",
            },
          },
        ];

  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.datePosted.toISOString(),
    ...(job.validThrough ? { validThrough: job.validThrough.toISOString() } : {}),
    employmentType: job.employmentTypes.map(employmentToSchema),
    jobLocation: locations,
    hiringOrganization: {
      "@type": "Organization",
      name: "Backschmiede Kölker",
      sameAs: baseUrl(),
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "DE",
    },
    ...(salary ? { baseSalary: salary } : {}),
    directApply: true,
    identifier: {
      "@type": "PropertyValue",
      name: "Backschmiede Kölker",
      value: job.id,
    },
    ...(job.startsAsap ? {} : job.startsAt ? { jobStartDate: job.startsAt.toISOString() } : {}),
    url,
  };
}

export function buildJobsListJsonLd(jobs: Job[]) {
  const base = baseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: jobs.map((j, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${base}/jobs/${j.slug}`,
      item: buildJobPostingJsonLd(j),
    })),
  };
}
