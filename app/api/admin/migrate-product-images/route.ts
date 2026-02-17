// app/api/admin/migrate-product-images/route.ts
import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { withAdminGuard } from "@/lib/auth-guards";
import { getPrisma } from "@/lib/prisma";
import { toStoredPath } from "@/app/lib/uploads";
import {
  deleteStoredPathIfUnused,
  pathFromStoredPath,
  safeUnlink,
} from "@/app/lib/uploads.server";
import {
  ensureDir,
  GRID_IMAGE_MAX_WIDTH,
  makeOptimizedFilename,
  optimizeToWebp,
  sanitizeFolderPath,
  WEBP_QUALITY,
} from "@/app/lib/image-optimizer.server";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_ERROR_ITEMS = 50;

type MigrationError = {
  id: string;
  reason: string;
};

function shortErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  return message.length > 180 ? `${message.slice(0, 177)}...` : message;
}

function folderFromStoredPath(stored: string) {
  const normalized = stored.replace(/\\/g, "/");
  const idx = normalized.lastIndexOf("/");
  const rawFolder = idx > 0 ? normalized.slice(0, idx) : "products";
  return sanitizeFolderPath(rawFolder, "products");
}

function nameBaseFromStoredPath(stored: string, fallback: string) {
  const normalized = stored.replace(/\\/g, "/");
  const filename = normalized.split("/").pop() || "";
  const base = filename.replace(/\.[^.]+$/, "");
  return base || fallback || "produkt";
}

export const POST = withAdminGuard(async () => {
  const products = await getPrisma().product.findMany({
    select: { id: true, name: true, imageUrl: true },
  });

  let converted = 0;
  let skippedNoImage = 0;
  let skippedAlreadyWebp = 0;
  let skippedMissing = 0;
  const errors: MigrationError[] = [];

  function pushError(id: string, reason: string) {
    if (errors.length < MAX_ERROR_ITEMS) {
      errors.push({ id, reason });
    }
  }

  for (const product of products) {
    const stored = toStoredPath(product.imageUrl);
    if (!stored) {
      skippedNoImage += 1;
      continue;
    }

    if (stored.toLowerCase().endsWith(".webp")) {
      skippedAlreadyWebp += 1;
      continue;
    }

    const sourceAbsPath = pathFromStoredPath(stored);
    if (!sourceAbsPath) {
      skippedMissing += 1;
      continue;
    }

    let inputBuffer: Buffer;
    try {
      inputBuffer = await readFile(sourceAbsPath);
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException;
      if (err?.code === "ENOENT") {
        skippedMissing += 1;
        continue;
      }
      pushError(product.id, shortErrorMessage(error, "Datei konnte nicht gelesen werden."));
      continue;
    }

    let optimized: Buffer;
    try {
      optimized = await optimizeToWebp(inputBuffer, {
        width: GRID_IMAGE_MAX_WIDTH,
        quality: WEBP_QUALITY,
      });
    } catch (error) {
      pushError(product.id, shortErrorMessage(error, "Bild konnte nicht konvertiert werden."));
      continue;
    }

    const folder = folderFromStoredPath(stored);
    const filename = makeOptimizedFilename({
      nameBase: nameBaseFromStoredPath(stored, product.name),
      bytes: optimized,
    });
    const targetDir = join(UPLOAD_DIR, folder);
    const targetAbsPath = join(targetDir, filename);
    const nextStored = `${folder}/${filename}`;

    try {
      await ensureDir(targetDir);
      await writeFile(targetAbsPath, optimized);
    } catch (error) {
      pushError(product.id, shortErrorMessage(error, "Optimiertes Bild konnte nicht gespeichert werden."));
      continue;
    }

    try {
      await getPrisma().product.update({
        where: { id: product.id },
        data: { imageUrl: nextStored },
      });
      await deleteStoredPathIfUnused(stored);
      converted += 1;
    } catch (error) {
      await safeUnlink(targetAbsPath).catch(() => {});
      pushError(product.id, shortErrorMessage(error, "DB-Update fehlgeschlagen."));
    }
  }

  return NextResponse.json({
    total: products.length,
    converted,
    skippedNoImage,
    skippedAlreadyWebp,
    skippedMissing,
    errors,
  });
});
