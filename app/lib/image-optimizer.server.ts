// app/lib/image-optimizer.server.ts
import "server-only";
import crypto from "node:crypto";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

export const GRID_IMAGE_MAX_WIDTH = 800;
export const WEBP_QUALITY = 75;
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export function fileSlug(input: string) {
  return input
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "ae").replace(/Ö/g, "oe").replace(/Ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[^\w\s-]/g, "")
    .toLowerCase().trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function sanitizeFolderPath(folderRaw?: string | null, fallback = "products") {
  const input = (folderRaw || "").trim();
  const parts = input
    .split(/[\\/]+/)
    .map((part) => fileSlug(part))
    .filter(Boolean);

  if (parts.length === 0) return fallback;
  return parts.join("/");
}

export async function ensureDir(folderAbs: string) {
  await mkdir(folderAbs, { recursive: true });
}

export function makeOptimizedFilename({
  nameBase,
  bytes,
}: {
  nameBase: string;
  bytes: Buffer;
}) {
  const base = fileSlug(nameBase) || "bild";
  const hash = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 10);
  return `${base}-${Date.now()}-${hash}.webp`;
}

export async function optimizeToWebp(
  input: Buffer,
  opts: { width: number; quality: number },
) {
  return sharp(input, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: opts.width, fit: "inside", withoutEnlargement: true })
    .webp({ quality: opts.quality, effort: 4 })
    .toBuffer();
}
