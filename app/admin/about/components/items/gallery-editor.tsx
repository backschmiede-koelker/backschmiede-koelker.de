// app/admin/about/components/items/gallery-editor.tsx
"use client";

import { useState } from "react";
import type { AboutSectionDTO } from "../../types";
import { Button, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import ImageUploader from "@/app/components/image-uploader";
import { createGallery, deleteGallery, updateGallery, getSectionById } from "../../actions";
import { useSortableList } from "../dnd/useSortableList";
import { GripVertical, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export default function GalleryEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);

  async function refreshSection() {
    const next = await getSectionById(section.id);
    onUpdated(next);
  }

  const sortable = useSortableList({
    items: section.gallery,
    onReorderPersist: async (next) => {
      await Promise.all(
        next.map((n) => {
          const cur = section.gallery.find((g) => g.id === n.id);
          if (!cur) return Promise.resolve();
          return updateGallery({
            id: n.id,
            imageUrl: cur.imageUrl,
            alt: cur.alt ?? null,
            sortOrder: n.sortOrder,
          });
        })
      );
      await refreshSection();
    },
  });

  const items = sortable.items;

  async function moveByArrow(id: string, dir: -1 | 1) {
    if (busy) return;

    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const j = idx + dir;
    if (j < 0 || j >= items.length) return;

    const nextLocal = items.slice();
    const [moved] = nextLocal.splice(idx, 1);
    nextLocal.splice(j, 0, moved);

    // local first for animation
    sortable.setLocalOrder(nextLocal);

    // persist immediately
    setBusy(true);
    try {
      await Promise.all(
        nextLocal.map((it, i) =>
          updateGallery({
            id: it.id,
            imageUrl: it.imageUrl,
            alt: it.alt ?? null,
            sortOrder: i,
          })
        )
      );
      await refreshSection();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Galerie</div>

      {/* CREATE BOX */}
      <div
        className="
          rounded-2xl border border-emerald-500/20 bg-emerald-50/40 shadow-sm
          dark:border-emerald-400/20 dark:bg-emerald-950/20
          p-4
        "
      >
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-900 dark:text-emerald-100">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white dark:bg-emerald-500/90">
            <ImageIcon size={16} />
          </span>
          Neues Bild hinzufügen
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="text-xs font-medium mb-2 text-zinc-800 dark:text-zinc-200">
              Bild
            </div>
            <ImageUploader folder="about" imageUrl={imageUrl} onChange={setImageUrl} />
          </div>

          <div className="md:col-span-2">
            <div className="text-xs font-medium mb-1 text-zinc-800 dark:text-zinc-200">
              Alt-Text <span className="text-zinc-500 dark:text-zinc-400">(optional)</span>
            </div>
            <TextInput value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>

          <div className="md:col-span-2 flex items-center justify-end">
            <Button
              disabled={busy || !imageUrl}
              onClick={async () => {
                setBusy(true);
                try {
                  await createGallery({
                    sectionId: section.id,
                    imageUrl,
                    alt: alt.trim() ? alt.trim() : null,
                    sortOrder: items.length, // always append
                  });
                  setImageUrl("");
                  setAlt("");
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
      </div>

      {/* LIST BOX */}
      <div
        className="
          rounded-2xl border border-zinc-200/70 bg-white/70 shadow-sm
          dark:border-zinc-800/80 dark:bg-zinc-950/30
          overflow-hidden
        "
      >
        <div className="px-4 py-3 border-b border-zinc-200/70 dark:border-zinc-800/80">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Vorhandene Bilder
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Reihenfolge per Drag & Drop oder mit den Pfeilen ändern (wird sofort gespeichert).
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
            Noch keine Galerie-Bilder.
          </div>
        ) : (
          <motion.div layout transition={{ duration: 0.22 }} className="p-3 space-y-3">
            <AnimatePresence initial={false}>
              {items.map((it, index) => (
                <motion.div
                  key={it.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="
                    rounded-2xl border border-zinc-200/80 bg-white shadow-sm
                    dark:border-zinc-800 dark:bg-zinc-900/40
                    p-3
                  "
                  {...sortable.bindDropTarget(it.id)}
                >
                  <div className="flex gap-3">
                    {/* CONTROLS */}
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <div
                        {...sortable.bindDragHandle(it.id)}
                        className="
                          cursor-grab active:cursor-grabbing rounded-lg p-2
                          border border-zinc-200 bg-zinc-50 hover:bg-zinc-100
                          dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/70
                        "
                        title="Ziehen"
                      >
                        <GripVertical size={18} />
                      </div>

                      <button
                        type="button"
                        disabled={busy || index === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void moveByArrow(it.id, -1);
                        }}
                        className="
                          w-10 h-10 flex items-center justify-center rounded-lg
                          border border-zinc-200 bg-white hover:bg-zinc-50
                          dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/70
                          disabled:opacity-30 disabled:cursor-not-allowed
                        "
                        title="Nach oben"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        type="button"
                        disabled={busy || index === items.length - 1}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void moveByArrow(it.id, 1);
                        }}
                        className="
                          w-10 h-10 flex items-center justify-center rounded-lg
                          border border-zinc-200 bg-white hover:bg-zinc-50
                          dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/70
                          disabled:opacity-30 disabled:cursor-not-allowed
                        "
                        title="Nach unten"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      <Row
                        imageUrl0={it.imageUrl}
                        alt0={it.alt ?? ""}
                        busy={busy}
                        onSave={async (n) => {
                          setBusy(true);
                          try {
                            await updateGallery({
                              id: it.id,
                              imageUrl: n.imageUrl,
                              alt: n.alt.trim() ? n.alt.trim() : null,
                              sortOrder: it.sortOrder,
                            });
                            await refreshSection();
                          } finally {
                            setBusy(false);
                          }
                        }}
                        onDelete={async () => {
                          setBusy(true);
                          try {
                            await deleteGallery(it.id);
                            await refreshSection();
                          } finally {
                            setBusy(false);
                          }
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Row({
  imageUrl0,
  alt0,
  busy,
  onSave,
  onDelete,
}: {
  imageUrl0: string;
  alt0: string;
  busy: boolean;
  onSave: (n: { imageUrl: string; alt: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState(imageUrl0);
  const [alt, setAlt] = useState(alt0);

  return (
    <div className="space-y-3">
      <div
        className="
          rounded-xl border border-zinc-200 bg-zinc-50/70 p-3
          dark:border-zinc-800 dark:bg-zinc-950/30
        "
      >
        <div className="text-xs font-medium mb-2 text-zinc-800 dark:text-zinc-200">
          Bild
        </div>
        <ImageUploader folder="about" imageUrl={imageUrl} onChange={setImageUrl} />
      </div>

      <div className="grid gap-2 md:grid-cols-6">
        <div className="md:col-span-4">
          <div className="text-xs font-medium mb-1 text-zinc-800 dark:text-zinc-200">
            Alt-Text <span className="text-zinc-500 dark:text-zinc-400">(optional)</span>
          </div>
          <TextInput value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>

        <div className="md:col-span-2 flex items-end justify-end gap-2">
          <Button disabled={busy} onClick={() => void onSave({ imageUrl, alt })}>
            Speichern
          </Button>
          <DeleteButton
            confirmText="Galerie-Bild wirklich löschen?"
            disabled={busy}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
