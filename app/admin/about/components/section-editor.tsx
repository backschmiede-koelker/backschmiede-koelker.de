// app/admin/about/components/section-editor.tsx
"use client";

import { useMemo, useState } from "react";
import type { AboutSectionDTO, AboutSectionType } from "../types";
import ImageUploader from "@/app/components/image-uploader";
import SelectBox from "@/app/components/select-box";
import { Button, Checkbox, TextArea, TextInput } from "./inputs";
import DeleteButton from "./delete-button";
import {
  deleteSection,
  updateSection,
} from "../actions";
import StatsEditor from "./items/stats-editor";
import ValuesEditor from "./items/values-editor";
import TimelineEditor from "./items/timeline-editor";
import FaqEditor from "./items/faq-editor";
import GalleryEditor from "./items/gallery-editor";

const TYPES: AboutSectionType[] = [
  "STORY",
  "VALUES",
  "STATS",
  "TIMELINE",
  "TEAM",
  "GALLERY",
  "FAQ",
  "CTA",
  "CUSTOM_TEXT",
];

export default function SectionEditor({
  section,
  onUpdated,
  onDeleted,
  canDelete,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
  onDeleted: () => void;
  canDelete: boolean;
}) {
  const [draft, setDraft] = useState(() => ({
    id: section.id,
    type: section.type,
    slug: section.slug,
    title: section.title ?? "",
    subtitle: section.subtitle ?? "",
    body: section.body ?? "",
    imageUrl: section.imageUrl ?? "",
    isActive: !!section.isActive,
    sortOrder: section.sortOrder ?? 0,
  }));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const itemBlock = useMemo(() => {
    if (section.type === "STATS") return <StatsEditor section={section} onUpdated={onUpdated} />;
    if (section.type === "VALUES") return <ValuesEditor section={section} onUpdated={onUpdated} />;
    if (section.type === "TIMELINE") return <TimelineEditor section={section} onUpdated={onUpdated} />;
    if (section.type === "FAQ") return <FaqEditor section={section} onUpdated={onUpdated} />;
    if (section.type === "GALLERY") return <GalleryEditor section={section} onUpdated={onUpdated} />;
    return null;
  }, [section, onUpdated]);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-white/5 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs opacity-70">{section.type} · {section.slug}</div>
          <div className="font-semibold truncate">{section.title || "—"}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={saving}
            onClick={async () => {
              setErr(null);
              setSaving(true);
              try {
                const next = await updateSection({
                  id: draft.id,
                  type: draft.type,
                  slug: draft.slug,
                  title: draft.title || null,
                  subtitle: draft.subtitle || null,
                  body: draft.body || null,
                  imageUrl: draft.imageUrl || null,
                  isActive: draft.isActive,
                  sortOrder: draft.sortOrder,
                });
                onUpdated(next);
              } catch (e: any) {
                setErr(e?.message || "Fehler beim Speichern");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Speichert…" : "Speichern"}
          </Button>

          {canDelete && (
            <DeleteButton
              confirmText="Bereich wirklich löschen?"
              onDelete={async () => {
                await deleteSection(section.id);
                onDeleted();
              }}
            />
          )}
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {err}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="text-xs font-medium mb-1">Typ</div>
          <SelectBox
            value={draft.type}
            onChange={(v) => setDraft((d) => ({ ...d, type: v as any }))}
            options={TYPES}
          />
        </div>

        <div className="md:col-span-1">
          <div className="text-xs font-medium mb-1">Slug</div>
          <TextInput value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} />
        </div>

        <div className="md:col-span-1">
          <div className="text-xs font-medium mb-1">SortOrder</div>
          <TextInput
            type="number"
            value={String(draft.sortOrder)}
            onChange={(e) => setDraft((d) => ({ ...d, sortOrder: Number(e.target.value) }))}
          />
        </div>

        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Titel</div>
          <TextInput value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
        </div>

        <div className="md:col-span-1 flex items-end">
          <Checkbox
            checked={draft.isActive}
            onChange={(v) => setDraft((d) => ({ ...d, isActive: v }))}
            label="Aktiv"
          />
        </div>

        <div className="md:col-span-3">
          <div className="text-xs font-medium mb-1">Untertitel</div>
          <TextInput value={draft.subtitle} onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))} />
        </div>

        <div className="md:col-span-3">
          <div className="text-xs font-medium mb-1">Body</div>
          <TextArea value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} />
        </div>

        <div className="md:col-span-3">
          <div className="text-xs font-medium mb-2">Bild</div>
          <ImageUploader
            folder="about"
            imageUrl={draft.imageUrl}
            onChange={(storedOrEmpty) => setDraft((d) => ({ ...d, imageUrl: storedOrEmpty }))}
          />
        </div>
      </div>

      {itemBlock && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
          {itemBlock}
        </div>
      )}
    </div>
  );
}
