// app/admin/about/components/section-add-picker.tsx
"use client";

import { useMemo, useState } from "react";
import type { AboutSectionDTO } from "../types";
import { Button, TextArea, TextInput } from "./inputs";
import ImageUploader from "@/app/components/image-uploader";
import { createSection } from "../actions";

type SectionType = AboutSectionDTO["type"];
type SingletonType = Exclude<SectionType, "CUSTOM_TEXT" | "HERO" | "TEAM">;

const SINGLETONS: { type: SingletonType; title: string; desc: string }[] = [
  { type: "VALUES", title: "Unsere Werte", desc: "Werte/Kernprinzipien als Karten." },
  { type: "STATS", title: "Zahlen / Stats", desc: "Kurze Kennzahlen (z. B. Filialen, Jahre, etc.)." },
  { type: "TIMELINE", title: "Timeline / Meilensteine", desc: "Historie als Meilensteine." },
  { type: "GALLERY", title: "Galerie", desc: "Bilderstrecke." },
  { type: "FAQ", title: "FAQ", desc: "Häufige Fragen." },
  { type: "CTA", title: "Call-to-Action", desc: "Jobs/Produkte oder externe URLs bewerben." },
];

function isExisting(sections: AboutSectionDTO[], type: SingletonType) {
  return sections.find((s) => s.type === type) ?? null;
}

export default function SectionAddPicker({
  sections,
  onCreated,
  onScrollToSection,
}: {
  sections: AboutSectionDTO[];
  onCreated: (created: AboutSectionDTO) => void;
  onScrollToSection: (sectionId: string) => void;
}) {
  const [openText, setOpenText] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const middleSections = useMemo(
    () => sections.filter((s) => s.type !== "HERO" && s.type !== "TEAM"),
    [sections]
  );

  const nextSortOrder = useMemo(() => {
    const max = Math.max(0, ...middleSections.map((s) => Number(s.sortOrder) || 0));
    return max + 10;
  }, [middleSections]);

  async function createSingleton(type: SingletonType) {
    setErr(null);
    setSaving(true);
    try {
      const created = await createSection({
        type,
        title: null,
        subtitle: null,
        body: null,
        imageUrl: null,
        isActive: true,
        sortOrder: nextSortOrder,
      });
      onCreated(created);
      onScrollToSection(created.id);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Fehler beim Erstellen");
    } finally {
      setSaving(false);
    }
  }

  async function createTextBlock() {
    setErr(null);
    setSaving(true);
    try {
      const created = await createSection({
        type: "CUSTOM_TEXT",
        title: title || null,
        subtitle: subtitle || null,
        body: body || null,
        imageUrl: imageUrl || null,
        isActive: true,
        sortOrder: nextSortOrder,
      });

      onCreated(created);
      onScrollToSection(created.id);

      setTitle("");
      setSubtitle("");
      setBody("");
      setImageUrl("");
      setOpenText(false);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Fehler beim Erstellen");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 admin-pad min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Abschnitt hinzufügen</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Einmalige Bereiche sind Module (max. 1×). Text kann mehrfach hinzugefügt werden.
          </div>
        </div>
      </div>

      {err && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {err}
        </div>
      )}

      {/* SINGLETONS */}
      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Einmalige Bereiche
        </div>

        <div className="mt-2 grid gap-3 lg:grid-cols-2 min-w-0">
          {SINGLETONS.map((x) => {
            const existing = isExisting(sections, x.type);

            const cardCls = existing
              ? "admin-surface admin-pad min-w-0"
              : "rounded-2xl border border-emerald-500/25 bg-white/70 dark:bg-zinc-950/30 shadow-sm admin-pad min-w-0";

            return (
              <div key={x.type} className={cardCls}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="font-semibold">{x.title}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {x.desc}
                    </div>

                    {existing ? (
                      <div className="mt-2 inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20">
                        Vorhanden ✓
                      </div>
                    ) : (
                      <div className="mt-2 inline-flex items-center rounded-full border border-zinc-300/60 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300 dark:border-zinc-700/60">
                        Noch nicht angelegt
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="admin-btn-row admin-btn-equal">
                      {existing ? (
                        <Button variant="ghost" onClick={() => onScrollToSection(existing.id)}>
                          Zum Abschnitt
                        </Button>
                      ) : (
                        <Button disabled={saving} onClick={() => createSingleton(x.type)}>
                          {saving ? "Erstellt…" : "Anlegen"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MULTI */}
      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Bausteine
        </div>

        <div className="mt-2 admin-surface admin-pad min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <div className="font-semibold">Text (frei)</div>
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Mehrfach nutzbar. Ideal für Story-Absätze, Philosophie, Handwerk, etc.
              </div>
            </div>

            <div className="admin-btn-row admin-btn-equal">
              <Button variant="ghost" onClick={() => setOpenText((o) => !o)}>
                {openText ? "Schließen" : "Text hinzufügen"}
              </Button>
            </div>
          </div>

          {openText && (
            <div className="mt-4 grid gap-3 lg:grid-cols-2 min-w-0">
              <div className="lg:col-span-2 min-w-0">
                <div className="text-xs font-medium mb-1">
                  Titel <span className="text-zinc-500">(optional)</span>
                </div>
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="lg:col-span-2 min-w-0">
                <div className="text-xs font-medium mb-1">
                  Untertitel <span className="text-zinc-500">(optional)</span>
                </div>
                <TextInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>

              <div className="lg:col-span-2 min-w-0">
                <div className="text-xs font-medium mb-1">
                  Text / Inhalt <span className="text-zinc-500">(optional)</span>
                </div>
                <TextArea value={body} onChange={(e) => setBody(e.target.value)} />
              </div>

              <div className="lg:col-span-2 min-w-0">
                <div className="text-xs font-medium mb-2">
                  Bild <span className="text-zinc-500">(optional)</span>
                </div>
                <ImageUploader folder="about" imageUrl={imageUrl} onChange={setImageUrl} />
              </div>

              <div className="lg:col-span-2 min-w-0">
                <div className="admin-btn-row admin-btn-equal">
                  <Button disabled={saving} onClick={createTextBlock}>
                    {saving ? "Erstellt…" : "Anlegen"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
