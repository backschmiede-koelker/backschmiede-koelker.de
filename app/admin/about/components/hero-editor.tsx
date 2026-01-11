// app/admin/about/components/hero-editor.tsx
"use client";

import { useState } from "react";
import type { AboutSectionDTO } from "../types";
import ImageUploader from "@/app/components/image-uploader";
import { Button, TextArea, TextInput } from "./inputs";
import { updateHero } from "../actions";

export default function HeroEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (next: AboutSectionDTO) => void;
}) {
  const [draft, setDraft] = useState(() => ({
    id: section.id,
    title: section.title ?? "",
    subtitle: section.subtitle ?? "",
    body: section.body ?? "",
    imageUrl: section.imageUrl ?? "",
    sortOrder: section.sortOrder ?? -1000,
  }));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-3 min-w-0">
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {err}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 min-w-0">
        <div className="min-w-0">
          <div className="text-xs font-medium mb-1">Titel</div>
          <TextInput
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Über uns"
          />
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium mb-1">Untertitel</div>
          <TextInput
            value={draft.subtitle}
            onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
            placeholder="z.B. Tradition · Handwerk · Liebe"
          />
        </div>

        <div className="lg:col-span-2 min-w-0">
          <div className="text-xs font-medium mb-1">Text</div>
          <TextArea
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            placeholder="Hero-Text…"
          />
        </div>

        <div className="lg:col-span-2 min-w-0">
          <div className="text-xs font-medium mb-2">Hero Bild</div>
          <div className="min-w-0">
            <ImageUploader
              folder="about"
              imageUrl={draft.imageUrl}
              onChange={(storedOrEmpty) => setDraft((d) => ({ ...d, imageUrl: storedOrEmpty }))}
            />
          </div>
        </div>

        <div className="lg:col-span-2 min-w-0">
          <div className="admin-btn-row admin-btn-equal">
            <Button
              disabled={saving}
              onClick={async () => {
                setErr(null);
                setSaving(true);
                try {
                  const next = await updateHero({
                    id: draft.id,
                    title: draft.title || null,
                    subtitle: draft.subtitle || null,
                    body: draft.body || null,
                    imageUrl: draft.imageUrl || null,
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
              {saving ? "Speichert…" : "Hero speichern"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
