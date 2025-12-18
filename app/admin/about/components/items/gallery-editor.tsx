// app/admin/about/components/items/gallery-editor.tsx
"use client";

import { useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import ImageUploader from "@/app/components/image-uploader";
import { createGallery, deleteGallery, updateGallery, updateSection } from "../../actions";

export default function GalleryEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [busy, setBusy] = useState(false);

  async function refreshSection() {
    const next = await updateSection({
      id: section.id,
      type: section.type,
      slug: section.slug,
      title: section.title ?? null,
      subtitle: section.subtitle ?? null,
      body: section.body ?? null,
      imageUrl: section.imageUrl ?? null,
      isActive: section.isActive,
      sortOrder: section.sortOrder,
    });
    onUpdated(next);
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Galerie</div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-2">Neues Bild</div>
          <ImageUploader folder="about" imageUrl={imageUrl} onChange={setImageUrl} />
        </div>

        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Alt-Text</div>
          <TextInput value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Sort</div>
          <TextInput type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>

        <div className="flex items-end">
          <Button
            disabled={busy || !imageUrl}
            onClick={async () => {
              setBusy(true);
              try {
                await createGallery({ sectionId: section.id, imageUrl, alt: alt || null, sortOrder });
                setImageUrl("");
                setAlt("");
                setSortOrder(0);
                await refreshSection();
              } finally {
                setBusy(false);
              }
            }}
          >
            Hinzufügen
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {section.gallery.map((it) => (
          <div key={it.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
            <Row
              imageUrl0={it.imageUrl}
              alt0={it.alt ?? ""}
              sort0={it.sortOrder}
              onSave={async (n) => {
                await updateGallery({ id: it.id, imageUrl: n.imageUrl, alt: n.alt || null, sortOrder: n.sortOrder });
                await refreshSection();
              }}
              onDelete={async () => {
                await deleteGallery(it.id);
                await refreshSection();
              }}
            />
          </div>
        ))}
        {section.gallery.length === 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Noch keine Galerie-Bilder.</div>
        )}
      </div>
    </div>
  );
}

function Row({
  imageUrl0,
  alt0,
  sort0,
  onSave,
  onDelete,
}: {
  imageUrl0: string;
  alt0: string;
  sort0: number;
  onSave: (n: { imageUrl: string; alt: string; sortOrder: number }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState(imageUrl0);
  const [alt, setAlt] = useState(alt0);
  const [sortOrder, setSortOrder] = useState(sort0);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-2">
      <div>
        <div className="text-xs font-medium mb-2">Bild</div>
        <ImageUploader folder="about" imageUrl={imageUrl} onChange={setImageUrl} />
      </div>

      <div className="grid gap-2 md:grid-cols-6">
        <div className="md:col-span-4">
          <div className="text-xs font-medium mb-1">Alt</div>
          <TextInput value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Sort</div>
          <TextInput type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <div className="flex items-end gap-2">
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onSave({ imageUrl, alt, sortOrder });
              } finally {
                setBusy(false);
              }
            }}
          >
            Speichern
          </Button>
          <DeleteButton
            confirmText="Galerie-Bild wirklich löschen?"
            disabled={busy}
            onDelete={async () => {
              setBusy(true);
              try {
                await onDelete();
              } finally {
                setBusy(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
