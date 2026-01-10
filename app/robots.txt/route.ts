// /app/robots.txt/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const body = `User-agent: *
Allow: /
Sitemap: https://www.example.com/sitemap.xml
`;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
