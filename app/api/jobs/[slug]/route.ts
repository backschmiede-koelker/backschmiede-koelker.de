// /app/api/jobs/[slug]/route.ts
import { NextResponse } from "next/server";
import { getJobBySlug } from "../../../lib/jobs/data";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const job = await getJobBySlug(params.slug);
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ...job,
    datePosted: job.datePosted.toISOString(),
    validThrough: job.validThrough?.toISOString(),
  });
}
