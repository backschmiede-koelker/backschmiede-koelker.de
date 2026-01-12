import type { MetadataRoute } from "next";
import { fetchJobs } from "./lib/jobs/db";
import { SITE_URL } from "./lib/seo";

export const revalidate = 21600;

const STATIC_ROUTES = [
  "",
  "/products",
  "/events",
  "/about",
  "/jobs",
  "/imprint",
  "/privacy",
];

function withBase(path: string) {
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: withBase(path),
    lastModified: now,
  }));

  let jobEntries: MetadataRoute.Sitemap = [];
  try {
    const jobs = await fetchJobs({ activeOnly: true });
    jobEntries = jobs.map((job) => ({
      url: withBase(`/jobs/${job.slug}`),
      lastModified: job.datePosted ?? now,
    }));
  } catch (error) {
    console.warn("sitemap: unable to load jobs", error);
  }

  return [...staticEntries, ...jobEntries];
}
