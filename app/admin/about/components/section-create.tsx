// app/admin/about/components/section-create.tsx
"use client";

import { useMemo, useState } from "react";
import type { AboutSectionDTO } from "../types";
import { createSection } from "../actions";
import { Button, TextArea, TextInput } from "./inputs";
import ImageUploader from "@/app/components/image-uploader";
import OptionSelect from "./option-select";

type SectionType = AboutSectionDTO["type"];

const TYPE_OPTIONS = [
  { value: "STORY", label: "Text-Block", singleton: false },
  { value: "CUSTOM_TEXT", label: "Text (frei)", singleton: false },

  { value: "VALUES", label: "Unsere Werte", singleton: true },
  { value: "STATS", label: "Zahlen / Stats", singleton: true },
  { value: "TIMELINE", label: "Timeline / Meilensteine", singleton: true },
  { value: "GALLERY", label: "Galerie", singleton: true },
  { value: "FAQ", label: "FAQ", singleton: true },
  { value: "CTA", label: "Call-to-Action", singleton: true },

  // ❌ TEAM bewusst NICHT hier
] as const satisfies readonly { value: SectionType; label: string; singleton: boolean }[];

// ✅ WICHTIG: explizit Set<SectionType> typisieren, sonst wird die Union “zu eng”
const SINGLETON_SET: ReadonlySet<SectionType> = new Set<SectionType>(
  TYPE_OPTIONS.filter((t) => t.singleton).map((t) => t.value)
);

export default function SectionCreate({
  sections,
  onCreated,
}: {
  sections: AboutSectionDTO[];
  onCreated: (created: AboutSectionDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<SectionType>("STORY");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const existsAlready = useMemo(() => {
    if (!SINGLETON_SET.has(type)) return false;
    return sections.some((s) => s.type === type);
  }, [type, sections]);

  const selectableOptions = useMemo(
    () => TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label })),
    []
  );

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Neuen Bereich anlegen</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Einige Bereiche sind absichtlich nur 1× erlaubt (Werte/Stats/…).
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
              <div className="text-xs font-medium mb-1">Bereich</div>
              <OptionSelect<SectionType>
                value={type}
                onChange={setType}
                options={selectableOptions}
                placeholder="Bereich wählen…"
              />
              {existsAlready && (
                <div className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  Dieser Bereich ist nur 1× erlaubt und existiert bereits.
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-medium mb-1">
                Sortierung <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput
                type="number"
                value={String(sortOrder)}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium mb-1">
                Titel <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium mb-1">
                Untertitel <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium mb-1">
                Text / Inhalt <span className="text-zinc-500">(optional)</span>
              </div>
              <TextArea value={body} onChange={(e) => setBody(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium mb-2">
                Bild <span className="text-zinc-500">(optional)</span>
              </div>
              <ImageUploader folder="about" imageUrl={imageUrl} onChange={setImageUrl} />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Aktiv
              </label>

              <Button
                disabled={saving || existsAlready}
                onClick={async () => {
                  setErr(null);
                  setSaving(true);
                  try {
                    const created = await createSection({
                      type,
                      title: title || null,
                      subtitle: subtitle || null,
                      body: body || null,
                      imageUrl: imageUrl || null,
                      isActive,
                      sortOrder,
                    });

                    onCreated(created);

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
