// /app/sitemap.ts
import { MetadataRoute } from "next";
import { allJobs } from "./lib/jobs/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.example.com";
  const jobs = await allJobs();
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...jobs.map((j) => ({
      url: `${base}/jobs/${j.slug}`,
      lastModified: j.datePosted,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
