// app/admin/about/components/section-editor.tsx
"use client";

import { useMemo, useState } from "react";
import type { AboutSectionDTO } from "../types";
import ImageUploader from "@/app/components/image-uploader";
import { Button, Checkbox, TextArea, TextInput } from "./inputs";
import DeleteButton from "./delete-button";
import { deleteSection, updateSection } from "../actions";
import StatsEditor from "./items/stats-editor";
import ValuesEditor from "./items/values-editor";
import TimelineEditor from "./items/timeline-editor";
import FaqEditor from "./items/faq-editor";
import GalleryEditor from "./items/gallery-editor";

const SINGLETON_TYPES = new Set<AboutSectionDTO["type"]>([
  "HERO",
  "TEAM",
  "VALUES",
  "STATS",
  "TIMELINE",
  "GALLERY",
  "FAQ",
  "CTA",
]);

function typeLabel(t: AboutSectionDTO["type"]) {
  switch (t) {
    case "CUSTOM_TEXT":
      return "Text (frei)";
    case "VALUES":
      return "Unsere Werte";
    case "STATS":
      return "Zahlen / Stats";
    case "TIMELINE":
      return "Timeline / Meilensteine";
    case "GALLERY":
      return "Galerie";
    case "FAQ":
      return "FAQ";
    case "CTA":
      return "Call-to-Action";
    case "TEAM":
      return "Team-Bereich";
    case "HERO":
      return "Hero";
    default:
      return t;
  }
}

function isProbablyUrl(input: string) {
  const v = input.trim();
  if (!v) return true;
  return v.startsWith("/") || /^https?:\/\//i.test(v);
}

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
  const isSingleton = SINGLETON_TYPES.has(section.type);

  const [draft, setDraft] = useState(() => ({
    id: section.id,
    title: section.title ?? "",
    subtitle: section.subtitle ?? "",
    body: section.body ?? "",
    imageUrl: section.imageUrl ?? "",
    isActive: !!section.isActive,
    sortOrder: section.sortOrder ?? 0,
  }));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const itemBlock = useMemo(() => {
    if (section.type === "STATS") return <StatsEditor section={section} onUpdated={onUpdated} />;
    if (section.type === "VALUES") return <ValuesEditor section={section} onUpdated={onUpdated} />;
    if (section.type === "TIMELINE") return <TimelineEditor section={section} onUpdated={onUpdated} />;
    if (section.type === "FAQ") return <FaqEditor section={section} onUpdated={onUpdated} />;
    if (section.type === "GALLERY") return <GalleryEditor section={section} onUpdated={onUpdated} />;
    return null;
  }, [section, onUpdated]);

  const isCta = section.type === "CTA";

  return (
    <div className="admin-nested-flat min-w-0">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
        <button type="button" onClick={() => setOpen((o) => !o)} className="min-w-0 text-left">
          <div className="text-xs opacity-70">{typeLabel(section.type)}</div>
          <div className="font-semibold truncate">
            {draft.title || "—"}{" "}
            <span className="text-xs font-normal opacity-60">{open ? "• geöffnet" : "• zugeklappt"}</span>
          </div>
        </button>

        <div className="admin-btn-row admin-btn-row-2 admin-btn-equal">
          <Button
            disabled={saving}
            onClick={async () => {
              setErr(null);

              if (isCta && !isProbablyUrl(draft.body)) {
                setErr("Bitte eine gültige URL eingeben (z.B. /kontakt oder https://…).");
                return;
              }

              setSaving(true);
              try {
                const next = await updateSection({
                  id: draft.id,
                  title: draft.title || null,
                  subtitle: draft.subtitle || null,
                  body: draft.body || null,
                  imageUrl: draft.imageUrl || null,
                  isActive: draft.isActive,
                  sortOrder: draft.sortOrder,
                });
                onUpdated(next);
              } catch (e: unknown) {
                setErr(e instanceof Error ? e.message : "Fehler beim Speichern");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Speichert…" : "Speichern"}
          </Button>

          <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
            {open ? "Schließen" : "Öffnen"}
          </Button>

          {!isSingleton && canDelete && (
            <DeleteButton
              confirmText="Bereich wirklich löschen?"
              disabled={saving}
              onDelete={async () => {
                try {
                  await deleteSection(section.id);
                  onDeleted();
                } catch (e: unknown) {
                  setErr(e instanceof Error ? e.message : "Fehler beim Löschen");
                }
              }}
            />
          )}

          {isSingleton && section.type !== "HERO" && (
            <Button
              variant={draft.isActive ? "softDanger" : "softSuccess"}
              disabled={saving}
              onClick={async () => {
                setErr(null);
                setSaving(true);
                try {
                  const next = await updateSection({
                    id: draft.id,
                    title: draft.title || null,
                    subtitle: draft.subtitle || null,
                    body: draft.body || null,
                    imageUrl: draft.imageUrl || null,
                    isActive: !draft.isActive,
                    sortOrder: draft.sortOrder,
                  });
                  setDraft((d) => ({ ...d, isActive: !!next.isActive }));
                  onUpdated(next);
                } catch (e: unknown) {
                  setErr(e instanceof Error ? e.message : "Fehler beim Ändern des Status");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {draft.isActive ? "Deaktivieren" : "Aktivieren"}
            </Button>
          )}
        </div>
      </div>

      {err && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {err}
        </div>
      )}

      {!open && (
        <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-400 space-y-1 break-words min-w-0">
          {isCta ? (
            <>
              {draft.subtitle ? <div className="truncate">Button: {draft.subtitle}</div> : null}
              {draft.body ? <div className="truncate">Link: {draft.body}</div> : null}
            </>
          ) : (
            <>
              {draft.subtitle ? <div className="truncate">{draft.subtitle}</div> : null}
              {draft.body ? <div className="line-clamp-2">{draft.body}</div> : null}
            </>
          )}
        </div>
      )}

      {open && (
        <div className="mt-4 space-y-4 min-w-0">
          <div className="grid gap-3 lg:grid-cols-3 min-w-0">
            <div className="lg:col-span-2 flex items-end min-w-0">
              <Checkbox
                checked={draft.isActive}
                onChange={(v) => setDraft((d) => ({ ...d, isActive: v }))}
                label="Aktiv"
              />
            </div>

            <div className="lg:col-span-3 min-w-0">
              <div className="text-xs font-medium mb-1">
                {isCta ? "Überschrift" : "Titel"} <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            </div>

            {isCta ? (
              <>
                <div className="lg:col-span-3 min-w-0">
                  <div className="text-xs font-medium mb-1">
                    Button-Text <span className="text-zinc-500">(optional)</span>
                  </div>
                  <TextInput
                    value={draft.subtitle}
                    onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                    placeholder='z.B. "Kontakt aufnehmen"'
                  />
                </div>

                <div className="lg:col-span-3 min-w-0">
                  <div className="text-xs font-medium mb-1">
                    Button-Link (URL) <span className="text-zinc-500">(optional)</span>
                  </div>
                  <TextInput
                    value={draft.body}
                    onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                    placeholder='z.B. "/kontakt" oder "https://example.com"'
                  />
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 break-words">
                    Tipp: z.B. <span className="font-medium">/jobs</span> für intern,{" "}
                    <span className="font-medium">https://…</span> für extern.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="lg:col-span-3 min-w-0">
                  <div className="text-xs font-medium mb-1">
                    Untertitel <span className="text-zinc-500">(optional)</span>
                  </div>
                  <TextInput value={draft.subtitle} onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))} />
                </div>

                <div className="lg:col-span-3 min-w-0">
                  <div className="text-xs font-medium mb-1">
                    Text / Inhalt <span className="text-zinc-500">(optional)</span>
                  </div>
                  <TextArea value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} />
                </div>
              </>
            )}

            <div className="lg:col-span-3 min-w-0">
              <div className="text-xs font-medium mb-2">
                Bild <span className="text-zinc-500">(optional)</span>
              </div>
              <div className="min-w-0">
                <ImageUploader
                  folder="about"
                  imageUrl={draft.imageUrl}
                  onChange={(storedOrEmpty) => setDraft((d) => ({ ...d, imageUrl: storedOrEmpty }))}
                />
              </div>
            </div>
          </div>

          {itemBlock && <div className="admin-nested-flat min-w-0">{itemBlock}</div>}
        </div>
      )}
    </div>
  );
}
