// app/admin/about/components/items/people-editor.tsx
"use client";

import { useMemo, useState } from "react";
import type { AboutPersonDTO, AboutSectionDTO } from "../../types";
import ImageUploader from "@/app/components/image-uploader";
import OptionSelect from "../option-select";
import { Button, TextArea, TextInput } from "../inputs";
import DeleteButton from "../delete-button";
import {
  createPerson,
  deletePerson,
  updatePerson,
  createSection,
  updateSection,
} from "../../actions";
import { PERSON_KIND_OPTIONS } from "../options";

export default function PeopleEditor({
  people,
  onChange,
  teamSection,
  onTeamSectionChange,
}: {
  people: AboutPersonDTO[];
  onChange: (next: AboutPersonDTO[]) => void;

  teamSection: AboutSectionDTO | null;
  onTeamSectionChange: (next: AboutSectionDTO | null) => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  const { lead, staff } = useMemo(() => {
    const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();
    const aNum = (n: any) => (Number.isFinite(n) ? n : 0);

    const bySortThenName = (a: AboutPersonDTO, b: AboutPersonDTO) => {
      const sa = aNum((a as any).sortOrder);
      const sb = aNum((b as any).sortOrder);
      if (sb !== sa) return sb - sa; // DESC (höher = weiter oben)
      const na = norm(a.name);
      const nb = norm(b.name);
      if (na < nb) return -1;
      if (na > nb) return 1;
      return String(a.id).localeCompare(String(b.id));
    };

    const sortedAll = [...people].sort(bySortThenName);

    const lead = sortedAll.filter((p) => p.kind === "OWNER" || p.kind === "MANAGER");
    const staff = sortedAll.filter((p) => p.kind === "TEAM_MEMBER");

    return { lead, staff };
  }, [people]);

  const total = lead.length + staff.length;

  return (
    <div className="space-y-6">
      {/* TEAM SECTION CONTROL */}
      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Team-Bereich</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Hier bearbeitest du Titel/Untertitel und ob der Team-Bereich aktiv ist.
              Welche Personen angezeigt werden, steuerst du unten pro Person über „Aktiv“.
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Öffnen/Schließen statt aktivieren/deaktivieren */}
            <Button variant="ghost" onClick={() => setTeamOpen((o) => !o)}>
              {teamOpen ? "Schließen" : "Öffnen"}
            </Button>

            {/* TEAM SECTION EXISTENCE: falls noch nicht existiert, kannst du sie anlegen */}
            {!teamSection && (
              <Button
                onClick={async () => {
                  const created = await createSection({
                    type: "TEAM" as any,
                    title: "Unser Team",
                    subtitle:
                      "Menschen, die jeden Morgen Teige kneten, Brote backen und Gäste beraten.",
                    body: null,
                    imageUrl: null,
                    isActive: true,
                    sortOrder: 9999,
                  });
                  onTeamSectionChange(created);
                  setTeamOpen(true);
                }}
              >
                Team-Bereich anlegen
              </Button>
            )}
          </div>
        </div>

        {/* Zusammenfassung wenn zugeklappt */}
        {!teamOpen && (
          <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            {teamSection ? (
              <div className="space-y-1">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {teamSection.title || "—"}
                </div>
                <div className="truncate">{teamSection.subtitle || "—"}</div>
                <div className="text-xs opacity-80">
                  Status:{" "}
                  <span className={teamSection.isActive ? "font-semibold" : "font-semibold"}>
                    {teamSection.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs">
                Noch kein Team-Bereich vorhanden. Klicke auf „Team-Bereich anlegen“.
              </div>
            )}
          </div>
        )}

        {/* Editor nur wenn offen */}
        {teamOpen && teamSection && (
          <TeamSectionEditor
            section={teamSection}
            onUpdated={(next) => onTeamSectionChange(next)}
          />
        )}

        {teamOpen && !teamSection && (
          <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Der Team-Bereich ist noch nicht angelegt.
          </div>
        )}
      </div>

      {/* CREATE PERSON */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Neue Person</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Du kannst steuern, ob die Person auf der Über-uns-Seite erscheint – über „Aktiv“.
            </div>
          </div>
          <Button variant="ghost" onClick={() => setCreateOpen((o) => !o)}>
            {createOpen ? "Schließen" : "Öffnen"}
          </Button>
        </div>

        {createOpen && (
          <CreatePersonForm
            onCreated={(p) => {
              onChange([...people, p]);
              setCreateOpen(false);
            }}
          />
        )}
      </div>

      {/* LIST – jetzt wie auf der Über-uns-Seite gruppiert */}
      {total === 0 ? (
        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/30 p-4 text-sm text-zinc-600 dark:text-zinc-400">
          Noch keine Personen angelegt.
        </div>
      ) : (
        <div className="space-y-6">
          {lead.length > 0 && (
            <GroupBlock title="Verantwortung & Leitung">
              {lead.map((p) => (
                <div key={p.id} className="p-4">
                  <PersonCard
                    person={p}
                    onUpdated={(next) =>
                      onChange(people.map((x) => (x.id === next.id ? next : x)))
                    }
                    onDeleted={() => onChange(people.filter((x) => x.id !== p.id))}
                  />
                </div>
              ))}
            </GroupBlock>
          )}

          {staff.length > 0 && (
            <GroupBlock title="Mitarbeiter">
              {staff.map((p) => (
                <div key={p.id} className="p-4">
                  <PersonCard
                    person={p}
                    onUpdated={(next) =>
                      onChange(people.map((x) => (x.id === next.id ? next : x)))
                    }
                    onDeleted={() => onChange(people.filter((x) => x.id !== p.id))}
                  />
                </div>
              ))}
            </GroupBlock>
          )}
        </div>
      )}
    </div>
  );
}

function GroupBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
      </div>

      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 overflow-hidden bg-white/60 dark:bg-zinc-950/30">
        <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
          {children}
        </div>
      </div>
    </div>
  );
}

function TeamSectionEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (s: AboutSectionDTO) => void;
}) {
  const [title, setTitle] = useState(section.title ?? "");
  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");

  // Aktiv -> erst beim Speichern persistieren
  const [active, setActive] = useState(!!section.isActive);

  const [saving, setSaving] = useState(false);

  return (
    <div className="mt-4 space-y-4">
      {/* Auffälliger Aktiv-Schalter (UI), speichert aber erst nach Button-Klick */}
      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/30 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Team-Bereich Status</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Der Status wird erst gespeichert, wenn du unten auf „Team-Bereich speichern“ klickst.
          </div>
        </div>

        {/* Toggle-Button ersetzt kleine Checkbox */}
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className={[
            "rounded-xl px-3 py-2 text-sm font-medium border shadow-sm transition active:scale-[0.99]",
            active
              ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/90 dark:hover:bg-emerald-500 dark:border-emerald-500/80"
              : "bg-white/80 text-zinc-900 border-zinc-300/80 hover:bg-zinc-50 dark:bg-zinc-900/60 dark:text-zinc-100 dark:border-zinc-700/80 dark:hover:bg-zinc-800/70",
          ].join(" ")}
        >
          {active ? "Aktiv" : "Inaktiv"}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">
            Titel <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="md:col-span-3">
          <div className="text-xs font-medium mb-1">
            Untertitel <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>

        <div className="md:col-span-3 flex items-center justify-end">
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const next = await updateSection({
                  id: section.id,
                  title: title || null,
                  subtitle: subtitle || null,
                  body: section.body ?? null,
                  imageUrl: section.imageUrl ?? null,
                  isActive: active,
                  sortOrder: section.sortOrder ?? 9999,
                });
                onUpdated(next);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Speichert…" : "Team-Bereich speichern"}
          </Button>
        </div>
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

  // UI nennt es "Aktiv" – mapped auf isShownOnAbout
  const [active, setActive] = useState(true);

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
          <div className="text-xs font-medium mb-1">Kategorie</div>
          <OptionSelect value={kind} onChange={setKind} options={PERSON_KIND_OPTIONS} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">
            Rollen-Label <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput
            value={roleLabel}
            onChange={(e) => setRoleLabel(e.target.value)}
            placeholder='z.B. "Inhaber"'
          />
        </div>

        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-1">
            Kurz-Bio <span className="text-zinc-500">(optional)</span>
          </div>
          <TextArea value={shortBio} onChange={(e) => setShortBio(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <div className="text-xs font-medium mb-2">
            Portrait <span className="text-zinc-500">(optional)</span>
          </div>
          <ImageUploader folder="about" imageUrl={avatarUrl} onChange={setAvatarUrl} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">
            E-Mail <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">
            Telefon <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">
            Instagram <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            placeholder="@backschmiede"
          />
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

        <div className="md:col-span-2 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Aktiv{" "}
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              (wird auf der Über-uns-Seite angezeigt)
            </span>
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
                  isShownOnAbout: active,
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
  const [open, setOpen] = useState(false);

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
    // UI nennt es Aktiv, wir speichern es in isShownOnAbout
    active: !!person.isShownOnAbout,
    sortOrder: person.sortOrder ?? 0,
  }));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const kindLabel =
    PERSON_KIND_OPTIONS.find((o) => o.value === draft.kind)?.label ?? draft.kind;

  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/20 p-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 text-left"
        >
          <div className="text-xs opacity-70">{kindLabel}</div>
          <div className="font-semibold truncate">
            {draft.name || "—"}{" "}
            <span className="text-xs font-normal opacity-60">
              {open ? "• geöffnet" : "• zugeklappt"}
            </span>
          </div>
        </button>

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
                  isShownOnAbout: draft.active,
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

          <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
            {open ? "Schließen" : "Öffnen"}
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
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {err}
        </div>
      )}

      {/* COLLAPSED SUMMARY */}
      {!open && (
        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
          <div className="text-xs">
            Status:{" "}
            <span className="font-semibold">
              {draft.active ? "Aktiv" : "Inaktiv"}
            </span>{" "}
            <span className="opacity-80">
              (Über-uns-Seite)
            </span>
          </div>
          {draft.roleLabel ? <div className="truncate">{draft.roleLabel}</div> : null}
          {draft.shortBio ? <div className="line-clamp-2">{draft.shortBio}</div> : null}
        </div>
      )}

      {/* BODY */}
      {open && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium mb-1">Name</div>
              <TextInput
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>

            <div>
              <div className="text-xs font-medium mb-1">Kategorie</div>
              <OptionSelect
                value={draft.kind}
                onChange={(v) => setDraft((d) => ({ ...d, kind: v }))}
                options={PERSON_KIND_OPTIONS}
              />
            </div>

            <div>
              <div className="text-xs font-medium mb-1">
                Rollen-Label <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput
                value={draft.roleLabel}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, roleLabel: e.target.value }))
                }
              />
            </div>

            <div>
              <div className="text-xs font-medium mb-1">
                Sortierung <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput
                type="number"
                value={String(draft.sortOrder)}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, sortOrder: Number(e.target.value) }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium mb-1">
                Kurz-Bio <span className="text-zinc-500">(optional)</span>
              </div>
              <TextArea
                value={draft.shortBio}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, shortBio: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-medium mb-2">
                Portrait <span className="text-zinc-500">(optional)</span>
              </div>
              <ImageUploader
                folder="about"
                imageUrl={draft.avatarUrl}
                onChange={(v) => setDraft((d) => ({ ...d, avatarUrl: v }))}
              />
            </div>

            <div>
              <div className="text-xs font-medium mb-1">
                E-Mail <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput
                type="email"
                value={draft.email}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, email: e.target.value }))
                }
              />
            </div>

            <div>
              <div className="text-xs font-medium mb-1">
                Telefon <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput
                value={draft.phone}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, phone: e.target.value }))
                }
              />
            </div>

            <div>
              <div className="text-xs font-medium mb-1">
                Instagram <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput
                value={draft.instagramHandle}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, instagramHandle: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, active: e.target.checked }))
                  }
                />
                Aktiv{" "}
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  (wird auf der Über-uns-Seite angezeigt)
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
