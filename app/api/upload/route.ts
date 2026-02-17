// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { withAdminGuard } from "@/lib/auth-guards";
import { deleteStoredPathIfUnused } from "@/app/lib/uploads.server";
import {
  ensureDir,
  GRID_IMAGE_MAX_WIDTH,
  makeOptimizedFilename,
  MAX_UPLOAD_BYTES,
  optimizeToWebp,
  sanitizeFolderPath,
  WEBP_QUALITY,
} from "@/app/lib/image-optimizer.server";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export const POST = withAdminGuard(async (req: Request) => {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const folderRaw = (form.get("folder") as string | null) ?? "products";
  const nameBase = (form.get("nameBase") as string | null) ?? file?.name ?? "bild";
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Datei ist zu gross (max. 15 MB)." }, { status: 400 });
  }

  const folder = sanitizeFolderPath(folderRaw, "products");
  const bytes = Buffer.from(await file.arrayBuffer());
  let optimized: Buffer;
  try {
    optimized = await optimizeToWebp(bytes, { width: GRID_IMAGE_MAX_WIDTH, quality: WEBP_QUALITY });
  } catch (error) {
    console.error("Upload image optimization failed:", error);
    return NextResponse.json(
      { error: "Datei ist kein gueltiges oder unterstuetztes Bildformat." },
      { status: 400 },
    );
  }

  const filename = makeOptimizedFilename({ nameBase, bytes: optimized });

  const dir = join(UPLOAD_DIR, folder);
  await ensureDir(dir);

  await writeFile(join(dir, filename), optimized);

  // Nur **DB-Speicherwert** zurückgeben (ohne '/uploads', ohne Host)
  const stored = `${folder}/${filename}`;
  return NextResponse.json({ url: stored });
});

export const DELETE = withAdminGuard(async (req: Request) => {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url) return NextResponse.json({ error: "Missing 'url'" }, { status: 400 });
    await deleteStoredPathIfUnused(url);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
});
