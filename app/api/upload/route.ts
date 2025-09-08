// /app/api/upload/route.ts
import { NextResponse } from "next/server";
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import crypto from "node:crypto";
import { prisma } from "lib/prisma";
import { pathFromAssetUrl, safeUnlink } from "@/app/lib/uploads";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const BASE_ASSET_URL = process.env.BASE_ASSET_URL || "https://cdn.backschmiede-koelker.de";

function fileSlug(s: string) {
  return s
    .replace(/ä/g,"ae")
    .replace(/ö/g,"oe")
    .replace(/ü/g,"ue")
    .replace(/Ä/g,"ae")
    .replace(/Ö/g,"oe")
    .replace(/Ü/g,"ue")
    .replace(/ß/g,"ss")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g,"")
    .toLowerCase()
    .trim()
    .replace(/\s+/g,"-")
    .replace(/-+/g,"-");
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const folder = (form.get("folder") as string | null) ?? "products";
  const nameBase = (form.get("nameBase") as string | null) ?? "bild";
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

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

  const url = `${BASE_ASSET_URL.replace(/\/+$/,"")}/${folder}/${filename}`;
  return NextResponse.json({ url });
}

async function deleteAssetIfUnused(url: string) {
  if (!url) return;
  const [p, n, o] = await prisma.$transaction([
    prisma.product.count({ where: { imageUrl: url } }),
    prisma.news.count({ where: { imageUrl: url } }),
    prisma.offer.count({ where: { imageUrl: url } }),
  ]);
  if (p + n + o === 0) await safeUnlink(pathFromAssetUrl(url));
}

export async function DELETE(req: Request) {
  try {
    const { url } = (await req.json()) as { url?: string };
    if (!url) {
      return NextResponse.json({ error: "Missing 'url'" }, { status: 400 });
    }
    await deleteAssetIfUnused(url);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
