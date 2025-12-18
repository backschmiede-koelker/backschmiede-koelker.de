// app/admin/about/components/people/people-editor.tsx
"use client";

import { useMemo, useState } from "react";
import type { AboutPersonDTO } from "../../types";
import ImageUploader from "@/app/components/image-uploader";
import SelectBox from "@/app/components/select-box";
import { Button, Checkbox, TextArea, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import { createPerson, deletePerson, updatePerson } from "../../actions";

const PERSON_KINDS = ["OWNER", "MANAGER", "TEAM_MEMBER"];

export default function PeopleEditor({
  people,
  onChange,
}: {
  people: AboutPersonDTO[];
  onChange: (next: AboutPersonDTO[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const sorted = useMemo(
    () => [...people].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [people]
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Neue Person</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Portrait via ImageUploader (DB speichert nur relative Pfade).
            </div>
          </div>
          <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
            {open ? "Schließen" : "Öffnen"}
          </Button>
        </div>

        {open && (
          <CreatePersonForm
            onCreated={(p) => {
              onChange([...people, p]);
              setOpen(false);
            }}
          />
        )}
      </div>

      <div className="space-y-4">
        {sorted.map((p) => (
          <PersonCard
            key={p.id}
            person={p}
            onUpdated={(next) =>
              onChange(people.map((x) => (x.id === next.id ? next : x)))
            }
            onDeleted={() => onChange(people.filter((x) => x.id !== p.id))}
          />
        ))}
        {sorted.length === 0 && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Noch keine Personen angelegt.
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePersonForm({ onCreated }: { onCreated: (p: AboutPersonDTO) => void }) {
  const [kind, setKind] = useState("TEAM_MEMBER");
  const [name, setName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [longBio, setLongBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [isShownOnAbout, setIsShownOnAbout] = useState(true);
  const [isShownInHero, setIsShownInHero] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="mt-4 space-y-3">
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {err}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Name</div>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Typ</div>
          <SelectBox value={kind} onChange={setKind} options={PERSON_KINDS} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Rollen-Label</div>
          <TextInput value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} placeholder='z.B. "Inhaber"' />
        </div>

        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Kurz-Bio</div>
          <TextArea value={shortBio} onChange={(e) => setShortBio(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-2">Portrait</div>
          <ImageUploader folder="about" imageUrl={avatarUrl} onChange={setAvatarUrl} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">E-Mail</div>
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Telefon</div>
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Instagram</div>
          <TextInput value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@backschmiede" />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">SortOrder</div>
          <TextInput type="number" value={String(sortOrder)} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isShownOnAbout} onChange={(e) => setIsShownOnAbout(e.target.checked)} />
            Auf /about anzeigen
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isShownInHero} onChange={(e) => setIsShownInHero(e.target.checked)} />
            Im Hero verwenden
          </label>
        </div>

        <div className="md:col-span-2 flex items-center justify-end">
          <Button
            disabled={saving || !name.trim()}
            onClick={async () => {
              setErr(null);
              setSaving(true);
              try {
                const created = await createPerson({
                  kind,
                  name,
                  roleLabel: roleLabel || null,
                  shortBio: shortBio || null,
                  longBio: longBio || null,
                  avatarUrl: avatarUrl || null,
                  email: email || null,
                  phone: phone || null,
                  instagramHandle: instagramHandle || null,
                  isShownOnAbout,
                  isShownInHero,
                  sortOrder,
                });
                onCreated(created);
              } catch (e: any) {
                setErr(e?.message || "Fehler beim Erstellen");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Speichert…" : "Anlegen"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PersonCard({
  person,
  onUpdated,
  onDeleted,
}: {
  person: AboutPersonDTO;
  onUpdated: (p: AboutPersonDTO) => void;
  onDeleted: () => void;
}) {
  const [draft, setDraft] = useState(() => ({
    id: person.id,
    kind: String(person.kind),
    name: person.name ?? "",
    roleLabel: person.roleLabel ?? "",
    shortBio: person.shortBio ?? "",
    longBio: person.longBio ?? "",
    avatarUrl: person.avatarUrl ?? "",
    email: person.email ?? "",
    phone: person.phone ?? "",
    instagramHandle: person.instagramHandle ?? "",
    isShownOnAbout: !!person.isShownOnAbout,
    isShownInHero: !!person.isShownInHero,
    sortOrder: person.sortOrder ?? 0,
  }));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-white/5 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs opacity-70">{draft.kind}</div>
          <div className="font-semibold truncate">{draft.name || "—"}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={saving}
            onClick={async () => {
              setErr(null);
              setSaving(true);
              try {
                const next = await updatePerson({
                  id: draft.id,
                  kind: draft.kind,
                  name: draft.name,
                  roleLabel: draft.roleLabel || null,
                  shortBio: draft.shortBio || null,
                  longBio: draft.longBio || null,
                  avatarUrl: draft.avatarUrl || null,
                  email: draft.email || null,
                  phone: draft.phone || null,
                  instagramHandle: draft.instagramHandle || null,
                  isShownOnAbout: draft.isShownOnAbout,
                  isShownInHero: draft.isShownInHero,
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

          <DeleteButton
            confirmText="Person wirklich löschen?"
            onDelete={async () => {
              await deletePerson(person.id);
              onDeleted();
            }}
          />
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {err}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs font-medium mb-1">Name</div>
          <TextInput value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Typ</div>
          <SelectBox value={draft.kind} onChange={(v) => setDraft((d) => ({ ...d, kind: v }))} options={PERSON_KINDS} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Rollen-Label</div>
          <TextInput value={draft.roleLabel} onChange={(e) => setDraft((d) => ({ ...d, roleLabel: e.target.value }))} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">SortOrder</div>
          <TextInput type="number" value={String(draft.sortOrder)} onChange={(e) => setDraft((d) => ({ ...d, sortOrder: Number(e.target.value) }))} />
        </div>

        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">Kurz-Bio</div>
          <TextArea value={draft.shortBio} onChange={(e) => setDraft((d) => ({ ...d, shortBio: e.target.value }))} />
        </div>

        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-2">Portrait</div>
          <ImageUploader folder="about" imageUrl={draft.avatarUrl} onChange={(v) => setDraft((d) => ({ ...d, avatarUrl: v }))} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">E-Mail</div>
          <TextInput type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Telefon</div>
          <TextInput value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Instagram</div>
          <TextInput value={draft.instagramHandle} onChange={(e) => setDraft((d) => ({ ...d, instagramHandle: e.target.value }))} />
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.isShownOnAbout} onChange={(e) => setDraft((d) => ({ ...d, isShownOnAbout: e.target.checked }))} />
            Auf /about anzeigen
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.isShownInHero} onChange={(e) => setDraft((d) => ({ ...d, isShownInHero: e.target.checked }))} />
            Im Hero verwenden
          </label>
        </div>
      </div>
    </div>
  );
}
