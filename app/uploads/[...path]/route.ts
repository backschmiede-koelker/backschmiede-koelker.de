import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveUploadPath(parts: string[]) {
  const clean = parts
    .flatMap((part) => part.split(/[\\/]+/))
    .map((part) => part.trim())
    .filter(Boolean);

  if (!clean.length || clean.some((part) => part === "." || part === "..")) {
    return null;
  }

  const base = resolve(UPLOAD_DIR);
  const candidate = resolve(base, ...clean);

  if (candidate !== base && !candidate.startsWith(`${base}${sep}`)) {
    return null;
  }

  return candidate;
}

function contentTypeFor(path: string) {
  return CONTENT_TYPES[extname(path).toLowerCase()] || "application/octet-stream";
}

async function serveFile(pathParts: string[], head = false) {
  const absolutePath = resolveUploadPath(pathParts);
  if (!absolutePath) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const fileStat = await stat(absolutePath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const body = head ? null : await readFile(absolutePath);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Content-Length": String(fileStat.size),
        "Content-Type": contentTypeFor(absolutePath),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "ENOENT") {
      return new NextResponse("Not found", { status: 404 });
    }

    console.error("[uploads] Failed to serve file", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(_: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return serveFile(path);
}

export async function HEAD(_: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return serveFile(path, true);
}
