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
import { useSortableList } from "../dnd/use-sortable-list";
import ReorderHeader from "../dnd/reorder-header";
import { AnimatePresence, motion } from "framer-motion";
import { Users } from "lucide-react";

type Kind = "OWNER" | "MANAGER" | "TEAM_MEMBER";

function isLead(kind: unknown) {
  return kind === "OWNER" || kind === "MANAGER";
}
function isStaff(kind: unknown) {
  return kind === "TEAM_MEMBER";
}

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
  const [busy, setBusy] = useState(false);

  const { lead, staff } = useMemo(() => {
    const aNum = (n: any) => (Number.isFinite(n) ? (n as number) : 0);

    const bySort = (a: AboutPersonDTO, b: AboutPersonDTO) =>
      aNum((a as any).sortOrder) - aNum((b as any).sortOrder) ||
      String(a.id).localeCompare(String(b.id));

    const lead = people.filter((p) => isLead(p.kind)).slice().sort(bySort);
    const staff = people.filter((p) => isStaff(p.kind)).slice().sort(bySort);

    return { lead, staff };
  }, [people]);

  const total = lead.length + staff.length;

  async function persistGroupOrder(nextLocal: AboutPersonDTO[], _group: "lead" | "staff") {
    setBusy(true);
    try {
      await Promise.all(
        nextLocal.map((p, i) =>
          updatePerson({
            id: p.id,
            kind: String(p.kind),
            name: p.name,
            roleLabel: p.roleLabel ?? null,
            shortBio: p.shortBio ?? null,
            longBio: p.longBio ?? null,
            avatarUrl: p.avatarUrl ?? null,
            email: p.email ?? null,
            phone: p.phone ?? null,
            instagramHandle: p.instagramHandle ?? null,
            isShownOnAbout: !!p.isShownOnAbout,
            sortOrder: i,
          })
        )
      );

      const ids = new Set(nextLocal.map((x) => x.id));
      const nextPeople = people.map((p) => {
        if (!ids.has(p.id)) return p;
        const idx = nextLocal.findIndex((x) => x.id === p.id);
        return { ...p, sortOrder: idx };
      });

      onChange(nextPeople);
    } finally {
      setBusy(false);
    }
  }

  const leadSortable = useSortableList({
    items: lead,
    onReorderPersist: async (next) => {
      const idToIndex = new Map(next.map((n: any) => [n.id, n.sortOrder]));
      const nextLocal = lead
        .slice()
        .sort((a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0));
      await persistGroupOrder(nextLocal, "lead");
    },
  });

  const staffSortable = useSortableList({
    items: staff,
    onReorderPersist: async (next) => {
      const idToIndex = new Map(next.map((n: any) => [n.id, n.sortOrder]));
      const nextLocal = staff
        .slice()
        .sort((a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0));
      await persistGroupOrder(nextLocal, "staff");
    },
  });

  async function moveByArrowInGroup(group: "lead" | "staff", id: string, dir: -1 | 1) {
    if (busy) return;

    const sortable = group === "lead" ? leadSortable : staffSortable;
    const items: AboutPersonDTO[] = sortable.items;

    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const j = idx + dir;
    if (j < 0 || j >= items.length) return;

    const nextLocal = items.slice();
    const [moved] = nextLocal.splice(idx, 1);
    nextLocal.splice(j, 0, moved);

    sortable.setLocalOrder(nextLocal);
    await persistGroupOrder(nextLocal, group);
  }

  return (
    <div className="space-y-6 min-w-0">
      {/* TEAM SECTION CONTROL */}
      <div className="admin-surface admin-pad min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Team-Bereich</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Titel/Untertitel & Status hier. Welche Personen angezeigt werden, steuerst du unten pro Person über „Aktiv“.
            </div>
          </div>

          <div className="admin-btn-row admin-btn-equal">
            <Button variant="ghost" onClick={() => setTeamOpen((o) => !o)}>
              {teamOpen ? "Schließen" : "Öffnen"}
            </Button>

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

        {!teamOpen && (
          <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 min-w-0">
            {teamSection ? (
              <div className="space-y-1 min-w-0">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {teamSection.title || "—"}
                </div>
                <div className="truncate">{teamSection.subtitle || "—"}</div>
                <div className="text-xs opacity-80">
                  Status:{" "}
                  <span className="font-semibold">
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

        {teamOpen && teamSection && (
          <TeamSectionEditor section={teamSection} onUpdated={(next) => onTeamSectionChange(next)} />
        )}

        {teamOpen && !teamSection && (
          <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Der Team-Bereich ist noch nicht angelegt.
          </div>
        )}
      </div>

      {/* CREATE PERSON */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 admin-pad min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Neue Person</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Du kannst steuern, ob die Person auf der Über-uns-Seite erscheint - über „Aktiv“.
            </div>
          </div>

          <div className="admin-btn-row admin-btn-equal">
            <Button variant="ghost" onClick={() => setCreateOpen((o) => !o)}>
              {createOpen ? "Schließen" : "Öffnen"}
            </Button>
          </div>
        </div>

        {createOpen && (
          <CreatePersonForm
            existingPeople={people}
            onCreated={(p) => {
              onChange([...people, p]);
              setCreateOpen(false);
            }}
          />
        )}
      </div>

      {/* LIST */}
      {total === 0 ? (
        <div className="admin-surface admin-pad text-sm text-zinc-600 dark:text-zinc-400 min-w-0">
          Noch keine Personen angelegt.
        </div>
      ) : (
        <div className="space-y-6 min-w-0">
          <GroupBlock
            title="Verantwortung & Leitung"
            subtitle="Drag & Drop oder Pfeile - nur innerhalb dieser Gruppe."
            icon={<Users size={16} />}
          >
            {leadSortable.items.length === 0 ? (
              <div className="p-3 sm:p-4 text-sm text-zinc-600 dark:text-zinc-400">
                Keine Personen in „Verantwortung & Leitung“.
              </div>
            ) : (
              <motion.div layout transition={{ duration: 0.22 }} className="p-2 sm:p-3 space-y-3 min-w-0">
                <AnimatePresence initial={false}>
                  {leadSortable.items.map((p: AboutPersonDTO, index: number) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="min-w-0"
                      {...leadSortable.bindDropTarget(p.id)}
                    >
                      <div className="admin-surface admin-pad min-w-0">
                        <ReorderHeader
                          disabled={busy}
                          isFirst={index === 0}
                          isLast={index === leadSortable.items.length - 1}
                          bindDragHandle={leadSortable.bindDragHandle(p.id)}
                          onUp={() => void moveByArrowInGroup("lead", p.id, -1)}
                          onDown={() => void moveByArrowInGroup("lead", p.id, 1)}
                          leftMeta={<div className="text-xs text-zinc-500">Position: {index + 1}</div>}
                        />

                        <PersonCard
                          person={p}
                          disableKindChangeToOtherGroup
                          onUpdated={(next) => onChange(people.map((x) => (x.id === next.id ? next : x)))}
                          onDeleted={() => onChange(people.filter((x) => x.id !== p.id))}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </GroupBlock>

          <GroupBlock
            title="Mitarbeiter"
            subtitle="Drag & Drop oder Pfeile - nur innerhalb dieser Gruppe."
            icon={<Users size={16} />}
          >
            {staffSortable.items.length === 0 ? (
              <div className="p-3 sm:p-4 text-sm text-zinc-600 dark:text-zinc-400">
                Keine Personen in „Mitarbeiter“.
              </div>
            ) : (
              <motion.div layout transition={{ duration: 0.22 }} className="p-2 sm:p-3 space-y-3 min-w-0">
                <AnimatePresence initial={false}>
                  {staffSortable.items.map((p: AboutPersonDTO, index: number) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="min-w-0"
                      {...staffSortable.bindDropTarget(p.id)}
                    >
                      <div className="admin-surface admin-pad min-w-0">
                        <ReorderHeader
                          disabled={busy}
                          isFirst={index === 0}
                          isLast={index === staffSortable.items.length - 1}
                          bindDragHandle={staffSortable.bindDragHandle(p.id)}
                          onUp={() => void moveByArrowInGroup("staff", p.id, -1)}
                          onDown={() => void moveByArrowInGroup("staff", p.id, 1)}
                          leftMeta={<div className="text-xs text-zinc-500">Position: {index + 1}</div>}
                        />

                        <PersonCard
                          person={p}
                          disableKindChangeToOtherGroup
                          onUpdated={(next) => onChange(people.map((x) => (x.id === next.id ? next : x)))}
                          onDeleted={() => onChange(people.filter((x) => x.id !== p.id))}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </GroupBlock>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI blocks ---------------- */

function GroupBlock({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {icon ? (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                {icon}
              </span>
            ) : null}
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          </div>
          {subtitle ? <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{subtitle}</div> : null}
        </div>
      </div>

      <div className="admin-surface overflow-hidden min-w-0">{children}</div>
    </div>
  );
}

/* ---------------- Team section editor ---------------- */

function TeamSectionEditor({
  section,
  onUpdated,
}: {
  section: AboutSectionDTO;
  onUpdated: (s: AboutSectionDTO) => void;
}) {
  const [title, setTitle] = useState(section.title ?? "");
  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");
  const [active, setActive] = useState(!!section.isActive);
  const [saving, setSaving] = useState(false);

  return (
    <div className="mt-4 space-y-4 min-w-0">
      <div className="admin-nested-flat p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Team-Bereich Status</div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Der Status wird erst gespeichert, wenn du unten auf „Team-Bereich speichern“ klickst.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className={[
            "h-10 inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 text-sm font-medium border shadow-sm transition active:scale-[0.99]",
            active
              ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/90 dark:hover:bg-emerald-500 dark:border-emerald-500/80"
              : "bg-white/80 text-zinc-900 border-zinc-300/80 hover:bg-zinc-50 dark:bg-zinc-900/60 dark:text-zinc-100 dark:border-zinc-700/80 dark:hover:bg-zinc-800/70",
          ].join(" ")}
        >
          {active ? "Aktiv" : "Inaktiv"}
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-3 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <div className="text-xs font-medium mb-1">
            Titel <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="lg:col-span-3 min-w-0">
          <div className="text-xs font-medium mb-1">
            Untertitel <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>

        <div className="lg:col-span-3 min-w-0">
          <div className="admin-btn-row admin-btn-equal">
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
    </div>
  );
}

/* ---------------- Create person ---------------- */

function CreatePersonForm({
  existingPeople,
  onCreated,
}: {
  existingPeople: AboutPersonDTO[];
  onCreated: (p: AboutPersonDTO) => void;
}) {
  const [kind, setKind] = useState<Kind>("TEAM_MEMBER");
  const [name, setName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [longBio, setLongBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nextSortOrder = useMemo(() => {
    const groupItems = existingPeople.filter((p) => (isLead(kind) ? isLead(p.kind) : isStaff(p.kind)));
    return groupItems.length;
  }, [existingPeople, kind]);

  return (
    <div className="mt-4 space-y-3 min-w-0">
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {err}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <div className="text-xs font-medium mb-1">Name</div>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium mb-1">Kategorie</div>
          <OptionSelect value={kind} onChange={(v) => setKind(v as Kind)} options={PERSON_KIND_OPTIONS} />
          <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
            Sortierung wird automatisch ans Ende der Gruppe gesetzt.
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium mb-1">
            Rollen-Label <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} placeholder='z.B. "Inhaber"' />
        </div>

        <div className="lg:col-span-2 min-w-0">
          <div className="text-xs font-medium mb-1">
            Kurz-Bio <span className="text-zinc-500">(optional)</span>
          </div>
          <TextArea value={shortBio} onChange={(e) => setShortBio(e.target.value)} />
        </div>

        <div className="lg:col-span-2 min-w-0">
          <div className="text-xs font-medium mb-2">
            Portrait <span className="text-zinc-500">(optional)</span>
          </div>
          <ImageUploader folder="about" imageUrl={avatarUrl} onChange={setAvatarUrl} />
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium mb-1">
            E-Mail <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium mb-1">
            Telefon <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="min-w-0">
          <div className="text-xs font-medium mb-1">
            Instagram <span className="text-zinc-500">(optional)</span>
          </div>
          <TextInput value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="@backschmiede" />
        </div>

        <div className="lg:col-span-2 flex flex-wrap gap-4 min-w-0">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Aktiv{" "}
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              (wird auf der Über-uns-Seite angezeigt)
            </span>
          </label>
        </div>

        <div className="lg:col-span-2 min-w-0">
          <div className="admin-btn-row admin-btn-equal">
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
                    sortOrder: nextSortOrder,
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
    </div>
  );
}

/* ---------------- Person card ---------------- */

function PersonCard({
  person,
  onUpdated,
  onDeleted,
  disableKindChangeToOtherGroup,
}: {
  person: AboutPersonDTO;
  onUpdated: (p: AboutPersonDTO) => void;
  onDeleted: () => void;
  disableKindChangeToOtherGroup?: boolean;
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
    active: !!person.isShownOnAbout,
  }));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const kindLabel = PERSON_KIND_OPTIONS.find((o) => o.value === draft.kind)?.label ?? draft.kind;

  const originalGroup: "lead" | "staff" = isLead(person.kind) ? "lead" : "staff";

  function clampKind(nextKind: string) {
    if (!disableKindChangeToOtherGroup) return nextKind;

    const nextGroup: "lead" | "staff" = isLead(nextKind) ? "lead" : "staff";
    if (nextGroup !== originalGroup) return String(person.kind);
    return nextKind;
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
        <button type="button" onClick={() => setOpen((o) => !o)} className="min-w-0 text-left">
          <div className="text-xs opacity-70">{kindLabel}</div>
          <div className="font-semibold truncate">
            {draft.name || "—"}{" "}
            <span className="text-xs font-normal opacity-60">{open ? "• geöffnet" : "• zugeklappt"}</span>
          </div>
        </button>

        <div className="admin-btn-row admin-btn-row-3 admin-btn-equal">
          <Button
            disabled={saving}
            onClick={async () => {
              setErr(null);
              setSaving(true);
              try {
                const next = await updatePerson({
                  id: draft.id,
                  kind: clampKind(draft.kind),
                  name: draft.name,
                  roleLabel: draft.roleLabel || null,
                  shortBio: draft.shortBio || null,
                  longBio: draft.longBio || null,
                  avatarUrl: draft.avatarUrl || null,
                  email: draft.email || null,
                  phone: draft.phone || null,
                  instagramHandle: draft.instagramHandle || null,
                  isShownOnAbout: draft.active,
                  sortOrder: person.sortOrder ?? 0,
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
            disabled={saving}
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

      {!open && (
        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-1 min-w-0">
          <div className="text-xs">
            Status: <span className="font-semibold">{draft.active ? "Aktiv" : "Inaktiv"}</span>{" "}
            <span className="opacity-80">(Über-uns-Seite)</span>
          </div>
          {draft.roleLabel ? <div className="truncate">{draft.roleLabel}</div> : null}
          {draft.shortBio ? <div className="line-clamp-2">{draft.shortBio}</div> : null}
        </div>
      )}

      {open && (
        <div className="mt-4 space-y-4 min-w-0">
          <div className="grid gap-3 lg:grid-cols-2 min-w-0">
            <div className="min-w-0">
              <div className="text-xs font-medium mb-1">Name</div>
              <TextInput value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </div>

            <div className="min-w-0">
              <div className="text-xs font-medium mb-1">Kategorie</div>
              <OptionSelect
                value={draft.kind}
                onChange={(v) => setDraft((d) => ({ ...d, kind: clampKind(v) }))}
                options={PERSON_KIND_OPTIONS}
              />
              {disableKindChangeToOtherGroup ? (
                <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                  Hinweis: Wechsel zwischen „Leitung“ ↔ „Mitarbeiter“ ist hier deaktiviert.
                </div>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="text-xs font-medium mb-1">
                Rollen-Label <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput value={draft.roleLabel} onChange={(e) => setDraft((d) => ({ ...d, roleLabel: e.target.value }))} />
            </div>

            <div className="lg:col-span-2 min-w-0">
              <div className="text-xs font-medium mb-1">
                Kurz-Bio <span className="text-zinc-500">(optional)</span>
              </div>
              <TextArea value={draft.shortBio} onChange={(e) => setDraft((d) => ({ ...d, shortBio: e.target.value }))} />
            </div>

            <div className="lg:col-span-2 min-w-0">
              <div className="text-xs font-medium mb-2">
                Portrait <span className="text-zinc-500">(optional)</span>
              </div>
              <ImageUploader
                folder="about"
                imageUrl={draft.avatarUrl}
                onChange={(v) => setDraft((d) => ({ ...d, avatarUrl: v }))}
              />
            </div>

            <div className="min-w-0">
              <div className="text-xs font-medium mb-1">
                E-Mail <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
            </div>

            <div className="min-w-0">
              <div className="text-xs font-medium mb-1">
                Telefon <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
            </div>

            <div className="min-w-0">
              <div className="text-xs font-medium mb-1">
                Instagram <span className="text-zinc-500">(optional)</span>
              </div>
              <TextInput value={draft.instagramHandle} onChange={(e) => setDraft((d) => ({ ...d, instagramHandle: e.target.value }))} />
            </div>

            <div className="lg:col-span-2 flex flex-wrap gap-4 min-w-0">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.active} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} />
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
