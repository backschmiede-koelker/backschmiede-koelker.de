// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import crypto from "node:crypto";
import { getPrisma } from "@/lib/prisma";
import { toStoredPath } from "@/app/lib/uploads";
import { pathFromStoredPath, safeUnlink } from "@/app/lib/uploads.server";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

function fileSlug(s: string) {
  return s
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "ae").replace(/Ö/g, "oe").replace(/Ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[^\w\s-]/g, "")
    .toLowerCase().trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const folderRaw = (form.get("folder") as string | null) ?? "products";
  const nameBase = (form.get("nameBase") as string | null) ?? "bild";
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const folder = fileSlug(folderRaw || "uploads") || "uploads";

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const hash = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 8);
  const prefix = fileSlug(nameBase);
  const filename = `${prefix}-${Date.now()}-${hash}.${ext}`;

  const dir = join(UPLOAD_DIR, folder);
  try { await stat(dir); } catch { await mkdir(dir, { recursive: true }); }

  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(join(dir, filename));
    ws.on("finish", resolve); ws.on("error", reject); ws.end(bytes);
  });

  // Nur **DB-Speicherwert** zurückgeben (ohne '/uploads', ohne Host)
  const stored = `${folder}/${filename}`;
  return NextResponse.json({ url: stored });
}

async function deleteByStoredPathIfUnused(stored?: string | null) {
  const s = toStoredPath(stored);
  if (!s) return;

  // Prüfen, ob noch referenziert
  const [p, n, o, e] = await getPrisma().$transaction([
    getPrisma().product.count({ where: { imageUrl: s } }),
    getPrisma().news.count({ where: { imageUrl: s } }),
    getPrisma().offer.count({ where: { imageUrl: s } }),
    getPrisma().event.count({ where: { imageUrl: s } }),
  ]);

  if (p + n + o + e === 0) {
    await safeUnlink(pathFromStoredPath(s));
  }
}

export async function DELETE(req: Request) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url) return NextResponse.json({ error: "Missing 'url'" }, { status: 400 });
    await deleteByStoredPathIfUnused(url);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
