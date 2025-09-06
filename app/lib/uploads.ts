// /app/lib/uploads.ts
import { join } from "node:path"
import { unlink } from "node:fs/promises"

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads"
const BASE = (process.env.BASE_ASSET_URL || "").replace(/\/+$/,"")

export function pathFromAssetUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    if (BASE && url.startsWith(BASE)) {
      const rel = url.slice(BASE.length).replace(/^\/+/,"")
      return join(UPLOAD_DIR, rel)
    }
    if (url.startsWith("/uploads/")) {
      const rel = url.slice("/uploads/".length)
      return join(UPLOAD_DIR, rel)
    }
    return null
  } catch {
    return null
  }
}

export async function safeUnlink(absPath: string | null) {
  if (!absPath) return false
  try {
    await unlink(absPath)
    return true
  } catch (e: any) {
    if (e?.code === "ENOENT") return false
    throw e
  }
}
