// /app/components/image-uploader.tsx
"use client"
import { useRef, useState } from "react"

type Props = {
  imageUrl: string
  onChange: (url: string) => void
}

export default function ImageUploader({ imageUrl, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", "products")
      fd.append("nameBase", file.name.replace(/\.[^.]+$/, ""))
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      onChange(url)
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) uploadFile(f)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={[
        "rounded-xl border-2 border-dashed p-5 transition-colors",
        dragOver
          ? "border-amber-500 bg-amber-50/70 dark:bg-amber-900/20"
          : `border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900`
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
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }}
          />
        </div>
      </div>

      {imageUrl && (
        <div className="mt-4 flex items-start gap-3">
          <img
            src={imageUrl}
            alt=""
            className="h-16 w-16 rounded object-cover ring-1 ring-black/10 dark:ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <div className="rounded-md bg-zinc-50 p-2 text-xs ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
              <div className="truncate" title={imageUrl}>{imageUrl}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={imageUrl} target="_blank" className="text-xs underline">Link öffnen</a>
              <button type="button" onClick={() => navigator.clipboard.writeText(imageUrl)} className="text-xs underline">
                Link kopieren
              </button>
              <button type="button" onClick={() => onChange("")} className="text-xs underline text-red-600">
                Bild entfernen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}