// /app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { fetchJobs } from "../../lib/jobs/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || undefined;
  const loc = searchParams.get("loc") || undefined;
  const role = searchParams.get("role") || undefined;

  const jobs = await fetchJobs({ q, loc, role });
  return NextResponse.json({
    count: jobs.length,
    items: jobs.map((j) => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      role: j.role,
      teaser: j.teaser,
      employmentType: j.employmentType,
      locations: j.locations,
      datePosted: j.datePosted.toISOString(),
      validThrough: j.validThrough?.toISOString(),
    })),
  });
}
