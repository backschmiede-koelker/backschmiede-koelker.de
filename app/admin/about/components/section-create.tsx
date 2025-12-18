// app/admin/about/components/section-create.tsx
"use client";

import { useMemo, useState } from "react";
import type { AboutSectionDTO, AboutSectionType } from "../types";
import { createSection } from "../actions";
import { Button, TextArea, TextInput, Checkbox } from "./inputs";
import SelectBox from "@/app/components/select-box";
import ImageUploader from "@/app/components/image-uploader";

const ALL_TYPES: AboutSectionType[] = [
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

export default function SectionCreate({
  sections,
  countsByType,
  uniqueTypes,
  onCreated,
}: {
  sections: AboutSectionDTO[];
  countsByType: Map<string, number>;
  uniqueTypes: Set<AboutSectionType>;
  onCreated: (created: AboutSectionDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AboutSectionType>("STORY");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const blocked = useMemo(() => {
    if (!uniqueTypes.has(type)) return false;
    return (countsByType.get(type) ?? 0) > 0;
  }, [type, countsByType, uniqueTypes]);

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Neuen Bereich anlegen</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            HERO ist fest. Einige Typen sind hier absichtlich „1x sinnvoll“ (VALUES/STATS/…).
          </div>
        </div>
        <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "Schließen" : "Öffnen"}
        </Button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {err}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium mb-1">Typ</div>
              <SelectBox
                value={type}
                onChange={(v) => setType(v as any)}
                options={ALL_TYPES}
                placeholder="Typ wählen"
              />
              {blocked && (
                <div className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  Dieser Typ ist als „einmalig“ gedacht und existiert schon. Erstelle stattdessen
                  keinen zweiten – bearbeite den vorhandenen.
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-medium mb-1">Slug (optional)</div>
              <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="z.B. unsere-werte" />
            </div>

            <div>
              <div className="text-xs font-medium mb-1">Titel</div>
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <div className="text-xs font-medium mb-1">SortOrder</div>
              <TextInput type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium mb-1">Untertitel</div>
              <TextInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium mb-1">Body</div>
              <TextArea value={body} onChange={(e) => setBody(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium mb-2">Bild</div>
              <ImageUploader folder="about" imageUrl={imageUrl} onChange={setImageUrl} />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Aktiv
              </label>

              <Button
                disabled={saving || blocked}
                onClick={async () => {
                  setErr(null);
                  setSaving(true);
                  try {
                    const created = await createSection({
                      type,
                      slug: slug || null,
                      title: title || null,
                      subtitle: subtitle || null,
                      body: body || null,
                      imageUrl: imageUrl || null,
                      isActive,
                      sortOrder,
                    });
                    onCreated(created);

                    // reset
                    setSlug("");
                    setTitle("");
                    setSubtitle("");
                    setBody("");
                    setImageUrl("");
                    setIsActive(true);
                    setSortOrder(0);
                    setOpen(false);
                  } catch (e: any) {
                    setErr(e?.message || "Fehler beim Erstellen");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Erstellt…" : "Bereich anlegen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
