// app/components/image-uploader.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { publicAssetUrl, toStoredPath } from "@/app/lib/uploads";

type Props = {
  folder: string;
  /** **DB-Speicherwert** ("folder/file") ODER absolute URL */
  imageUrl: string;
  /** Erwartet **DB-Speicherwert** ("folder/file") oder "" zum Löschen */
  onChange: (url: string) => void;
};

/** Liefert die bevorzugte CDN-Basis (Env) oder errät sie aus der aktuellen Domain (→ cdn.<host>) */
function assetBaseClient(): string | null {
  const env = (process.env.NEXT_PUBLIC_BASE_ASSET_URL || "").replace(/\/+$/, "");
  if (env) return env;
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    // Wenn wir bereits auf dem CDN sind, nutze es; sonst 'cdn.' davorhängen
    const cdnHost = hostname.startsWith("cdn.") ? hostname : `cdn.${hostname.replace(/^cdn\./, "")}`;
    return `${protocol}//${cdnHost}`;
  }
  return null;
}

/** Erzwingt eine absolut auflösbare CDN-URL aus DB-Wert / beliebiger Eingabe. */
function absoluteCdnUrl(input?: string | null): string | null {
  if (!input) return null;

  // 1) Wenn bereits absolut/data/blob → direkt anzeigen
  const direct = String(input).trim();
  if (/^(https?:|data:|blob:)/i.test(direct)) return direct;

  // 2) Versuche erst die "offizielle" Hilfsfunktion
  const viaHelper = publicAssetUrl(direct);
  if (viaHelper && /^https?:\/\//i.test(viaHelper)) return viaHelper;

  // 3) Fallback: CDN-Basis erraten + DB-Speicherwert rekonstruieren
  const base = assetBaseClient();
  const stored = toStoredPath(direct);
  if (base && stored) return `${base}/${stored}`;

  // 4) Letzter Fallback: ggf. App-Relativpfad (funktioniert, wenn die App /uploads bedient)
  return viaHelper || null;
}

export default function ImageUploader({ folder, imageUrl, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewOverride, setPreviewOverride] = useState<string | null>(null); // lokale Vorschau (Blob/CDN)
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Aus Prop (DB-Wert oder absolut) eine anzeigbare URL ableiten - kann vom override übersteuert werden
  const derivedPreview = imageUrl ? absoluteCdnUrl(imageUrl) || "" : "";
  const previewSrc = previewOverride ?? derivedPreview;

  // Wenn parent imageUrl ändert (z. B. nach Speichern), den Override zurücknehmen und neu ableiten
  useEffect(() => {
    setPreviewOverride(null);
  }, [imageUrl]);

  // Beim Entfernen
  async function removeCurrentImage() {
    if (!imageUrl) {
      onChange("");
      setPreviewOverride(null);
      return;
    }
    setDeleting(true);
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }), // Server wandelt in Stored-Path um
      }).catch(() => {});
    } finally {
      setDeleting(false);
      onChange("");
      setPreviewOverride(null);
    }
  }

  // Upload + sofortige Vorschau
  async function uploadFile(file: File) {
    // 1) Sofortige lokale Vorschau
    const blobUrl = URL.createObjectURL(file);
    setPreviewOverride(blobUrl);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      fd.append("nameBase", file.name.replace(/\.[^.]+$/, ""));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = (await res.json()) as { url: string }; // **DB-Speicherwert**: "folder/file.ext"

      // Optionale Alt-Datei abräumen (fail-silent)
      if (imageUrl && imageUrl !== url) {
        fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl }),
        }).catch(() => {});
      }

      // 2) Nach erfolgreichem Upload: echte CDN-URL berechnen und anzeigen
      const absolute = absoluteCdnUrl(url) || "";
      setPreviewOverride(absolute);

      // 3) Parent mit **DB-Speicherwert** updaten
      onChange(url);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadFile(f);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={[
        "rounded-xl border-2 border-dashed p-5 transition-colors",
        dragOver ? "border-amber-500 bg-amber-50/70 dark:bg-amber-900/20"
                 : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-medium">Bild hochladen</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Datei hierher ziehen oder klicken</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60 dark:bg-amber-500 dark:hover:bg-amber-400"
            disabled={uploading}
          >
            {uploading ? "Lädt…" : "Datei wählen"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
            }}
          />
        </div>
      </div>

      {(imageUrl || previewSrc) && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          {/* 4) Vorschau */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc || ""}
            alt=""
            className="h-16 w-16 rounded object-cover ring-1 ring-black/10 dark:ring-white/10"
          />

          <div className="min-w-0 flex-1">
            {/* 5) Link (Textbox) */}
            <div className="rounded-md bg-zinc-50 p-2 text-xs ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
              <div className="truncate" title={previewSrc || ""}>
                {previewSrc}
              </div>
            </div>

            {/* 6/7/8) Aktionen: Mobile untereinander, ab sm in Reihe */}
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
              <a href={previewSrc || "#"} target="_blank" className="text-xs underline">
                Link öffnen
              </a>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(previewSrc || "")}
                className="text-xs underline text-left sm:text-left"
              >
                Link kopieren
              </button>
              <button
                type="button"
                onClick={removeCurrentImage}
                className="text-xs underline text-red-600 disabled:opacity-60 text-left sm:text-left"
                disabled={deleting}
              >
                {deleting ? "Löscht…" : "Bild entfernen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
