// app/admin/jobs/components/new-job-form.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import FieldLabel from "@/app/components/ui/field-label";
import SelectBox from "@/app/components/select-box";
import type {
  JobCategory,
  JobEmploymentType,
  JobLocation,
  JobSalaryUnit,
} from "@/app/lib/jobs/types";
import { JOB_PRESETS } from "./presets";
import MultiChipInput from "./multi-chip-input";
import { TAG_SUGGESTIONS } from "./tag-suggestions";
import { sortEmploymentTypes } from "@/app/components/jobs/formatters";

const DEFAULT_APPLY_EMAIL = "info@backschmiede-koelker.de";
const DEFAULT_APPLY_URL: string | null = null;
const DEFAULT_CONTACT_PHONE: string | null = null;

const EMPLOYMENT: { value: JobEmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Vollzeit" },
  { value: "PART_TIME", label: "Teilzeit" },
  { value: "MINI_JOB", label: "Minijob" },
  { value: "APPRENTICESHIP", label: "Ausbildung" },
];

const CATEGORY_OPTIONS: { value: JobCategory; label: string }[] = [
  { value: "BAECKER", label: "Bäcker/in" },
  { value: "KONDITOR", label: "Konditor/in" },
  { value: "VERKAEUFER", label: "Verkauf" },
  { value: "AZUBI", label: "Ausbildung" },
  { value: "AUSHILFE", label: "Aushilfe" },
  { value: "LOGISTIK", label: "Logistik" },
  { value: "PRODUKTION", label: "Produktion" },
  { value: "VERWALTUNG", label: "Verwaltung" },
  { value: "SONSTIGES", label: "Sonstiges" },
];

function toCentsFromInput(v: string) {
  const s = v.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.round(n * 100));
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));
}

function toIntOrZero(v: string) {
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

export default function NewJobForm({
  onCreated,
  highestPriority,
}: {
  onCreated: () => void;
  highestPriority: { value: number; title: string } | null;
}) {
  const [open, setOpen] = useState(false);

  const headerRef = useRef<HTMLButtonElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [presetKey, setPresetKey] = useState<string>("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<JobCategory>("SONSTIGES");
  const [teaser, setTeaser] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState<number>(0);

  const [employmentTypes, setEmploymentTypes] = useState<JobEmploymentType[]>([
    "FULL_TIME",
    "PART_TIME",
  ]);
  const [locations, setLocations] = useState<JobLocation[]>([
    "METTINGEN",
    "RECKE",
  ]);

  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);

  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryUnit, setSalaryUnit] = useState<JobSalaryUnit>("MONTH");

  const [shift, setShift] = useState<string>("");
  const [workloadNote, setWorkloadNote] = useState<string>("");

  const [startsAsap, setStartsAsap] = useState(true);
  const [startsAt, setStartsAt] = useState("");

  const [applyEmail, setApplyEmail] = useState<string>(DEFAULT_APPLY_EMAIL);
  const [applyUrl, setApplyUrl] = useState<string>(DEFAULT_APPLY_URL ?? "");
  const [contactPhone, setContactPhone] = useState<string>(
    DEFAULT_CONTACT_PHONE ?? ""
  );

  const [isActive, setIsActive] = useState(true);

  const suggestions = useMemo(() => {
    const fromPresets = {
      responsibilities: JOB_PRESETS.flatMap((p) => p.responsibilities),
      qualifications: JOB_PRESETS.flatMap((p) => p.qualifications),
      benefits: JOB_PRESETS.flatMap((p) => p.benefits),
    };

    return {
      responsibilities: uniq([
        ...fromPresets.responsibilities,
        ...TAG_SUGGESTIONS.responsibilities,
      ]),
      qualifications: uniq([
        ...fromPresets.qualifications,
        ...TAG_SUGGESTIONS.qualifications,
      ]),
      benefits: uniq([...fromPresets.benefits, ...TAG_SUGGESTIONS.benefits]),
    };
  }, []);

  function closeAndKeepView() {
    const el = headerRef.current;
    const topBefore = el ? el.getBoundingClientRect().top + window.scrollY : null;

    setOpen(false);

    requestAnimationFrame(() => {
      if (topBefore == null) return;
      window.scrollTo({ top: Math.max(0, topBefore - 100), behavior: "smooth" });
    });
  }

  function applyPreset(key: string) {
    setPresetKey(key);
    const p = JOB_PRESETS.find((x) => x.key === key);
    if (!p) return;

    setTitle(p.title);
    setCategory(p.category);
    setTeaser(p.teaser);
    setDescription(p.description);
    setEmploymentTypes(sortEmploymentTypes(p.employmentTypes));
    setResponsibilities(p.responsibilities);
    setQualifications(p.qualifications);
    setBenefits(p.benefits);

    // ✅ Komfort: Wenn man Preset wählt, Form automatisch aufklappen
    setOpen(true);
  }

  function toggleEmployment(t: JobEmploymentType) {
    setEmploymentTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function toggleLocation(l: JobLocation) {
    setLocations((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  }

  function resetForm() {
    setPresetKey("");
    setTitle("");
    setCategory("SONSTIGES");
    setTeaser("");
    setDescription("");
    setPriority(0);
    setEmploymentTypes(["FULL_TIME", "PART_TIME"]);
    setLocations(["METTINGEN", "RECKE"]);
    setResponsibilities([]);
    setQualifications([]);
    setBenefits([]);
    setSalaryMin("");
    setSalaryMax("");
    setSalaryUnit("MONTH");
    setShift("");
    setWorkloadNote("");
    setStartsAsap(true);
    setStartsAt("");
    setApplyEmail(DEFAULT_APPLY_EMAIL);
    setApplyUrl(DEFAULT_APPLY_URL ?? "");
    setContactPhone(DEFAULT_CONTACT_PHONE ?? "");
    setIsActive(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!employmentTypes.length) {
      alert("Bitte mindestens eine Beschäftigungsart auswählen.");
      return;
    }
    if (!locations.length) {
      alert("Bitte mindestens einen Standort auswählen.");
      return;
    }

    setSaving(true);
    try {
      const minC = toCentsFromInput(salaryMin);
      const maxC = toCentsFromInput(salaryMax);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          teaser,
          description,
          priority: toIntOrZero(String(priority)),
          employmentTypes: sortEmploymentTypes(employmentTypes),
          locations,
          responsibilities,
          qualifications,
          benefits,
          salaryMinCents: minC,
          salaryMaxCents: maxC,
          salaryUnit: minC || maxC ? salaryUnit : null,
          startsAsap,
          startsAt: startsAsap ? null : startsAt || null,
          shift: shift.trim() || null,
          workloadNote: workloadNote.trim() || null,
          applyEmail: applyEmail.trim() || null,
          applyUrl: applyUrl.trim() || null,
          contactPhone: contactPhone.trim() || null,
          isActive,
        }),
      });

      if (!res.ok) {
        alert("Speichern fehlgeschlagen.");
        return;
      }

      resetForm();

      closeAndKeepView();

      await onCreated();
    } finally {
      setSaving(false);
    }
  }

  const inputBase =
    "w-full min-w-0 rounded-xl border border-zinc-300/90 px-3 py-2.5 bg-white dark:bg-zinc-900/50 text-sm shadow-sm " +
    "outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/40 " +
    "dark:border-white/10 dark:text-zinc-100";

  const dateDisabledClass =
    "bg-zinc-200/90 text-zinc-700 border-zinc-400/80 shadow-inner cursor-not-allowed " +
    "opacity-80 saturate-0 " +
    "dark:bg-zinc-950/70 dark:text-zinc-500 dark:border-zinc-800 dark:opacity-70";

  const chipBase =
    "inline-flex max-w-full min-w-0 items-start rounded-2xl px-3 py-2 text-xs ring-1 transition " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30";

  const chipWrap =
    "mt-2 flex flex-wrap gap-2 min-w-0 px-1 py-1 overflow-visible";

  // ✅ Button-Stil wie im Admin (sekundär)
  const secondaryBtn =
    "inline-flex items-center justify-center rounded-xl " +
    "border border-zinc-300/90 bg-white/80 px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition " +
    "hover:bg-zinc-50 hover:shadow active:translate-y-[1px] " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 " +
    "dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800/60";

  // ✅ Header klickbar (Accordion), aber nur der Header - nicht das gesamte Form,
  //    damit Klicks in Inputs nicht ständig toggeln.
  const headerButton =
    "w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-xl";

  return (
    <section className="mt-6 rounded-2xl border border-zinc-300/80 bg-white/90 dark:border-white/10 dark:bg-white/5 p-4 sm:p-5 shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/10 dark:shadow-none dark:ring-0 min-w-0 overflow-x-hidden">
      {/* ✅ Klickbarer Header zum Ein-/Ausklappen */}
      <button
        ref={headerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={headerButton}
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-extrabold tracking-tight">
              Neue Stellenanzeige
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              {open ? "Preset wählen → anpassen → speichern." : "Zum Öffnen klicken."}
            </p>
          </div>
        </div>
      </button>

      {/* ✅ Body nur rendern wenn offen */}
      {open && (
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 min-w-0">
          <div className="min-w-0">
            <FieldLabel>
              Preset <span className="text-xs text-zinc-500">(optional)</span>
            </FieldLabel>
            <div className="mt-1">
              <SelectBox
                value={
                  presetKey
                    ? JOB_PRESETS.find((p) => p.key === presetKey)?.label ||
                      "Preset wählen"
                    : "Preset wählen"
                }
                onChange={(label) => {
                  const found = JOB_PRESETS.find((p) => p.label === label);
                  if (found) applyPreset(found.key);
                }}
                options={["Preset wählen", ...JOB_PRESETS.map((p) => p.label)]}
              />
            </div>
          </div>

          <div className="min-w-0">
            <FieldLabel>Titel</FieldLabel>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputBase}
              placeholder='z.B. "Bäcker/in (m/w/d)"'
            />
          </div>

          <div className="min-w-0">
            <FieldLabel>Bereich</FieldLabel>
            <div className="mt-1">
              <SelectBox
                value={
                  CATEGORY_OPTIONS.find((o) => o.value === category)?.label ||
                  "Sonstiges"
                }
                onChange={(label) => {
                  const found = CATEGORY_OPTIONS.find((o) => o.label === label);
                  if (found) setCategory(found.value);
                }}
                options={CATEGORY_OPTIONS.map((o) => o.label)}
              />
            </div>
          </div>

          <div className="min-w-0">
            <FieldLabel>Priorität</FieldLabel>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(toIntOrZero(e.target.value))}
              className={inputBase + " mt-1"}
            />
            {highestPriority && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Aktuell höchste Priorität:{" "}
                <span className="font-medium">{highestPriority.value}</span> (
                {highestPriority.title})
              </p>
            )}
          </div>

          <div className="min-w-0">
            <FieldLabel>Beschäftigungsarten</FieldLabel>
            <div className={chipWrap}>
              {EMPLOYMENT.map((o) => {
                const active = employmentTypes.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleEmployment(o.value)}
                    className={[
                      chipBase,
                      active
                        ? "bg-emerald-100 ring-emerald-300 text-emerald-950 hover:bg-emerald-200 " +
                          "dark:bg-emerald-900/30 dark:ring-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900/45"
                        : "bg-zinc-100 ring-zinc-300 text-zinc-900 hover:bg-zinc-200 " +
                          "dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700/70",
                    ].join(" ")}
                  >
                    <span className="whitespace-normal break-words leading-snug">
                      {o.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0">
            <FieldLabel>Standorte</FieldLabel>
            <div className={chipWrap}>
              {[
                { v: "METTINGEN" as const, label: "Mettingen" },
                { v: "RECKE" as const, label: "Recke" },
              ].map((o) => {
                const active = locations.includes(o.v);
                return (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => toggleLocation(o.v)}
                    className={[
                      chipBase,
                      active
                        ? "bg-emerald-100 ring-emerald-300 text-emerald-950 hover:bg-emerald-200 " +
                          "dark:bg-emerald-900/30 dark:ring-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900/45"
                        : "bg-zinc-100 ring-zinc-300 text-zinc-900 hover:bg-zinc-200 " +
                          "dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-700/70",
                    ].join(" ")}
                  >
                    <span className="whitespace-normal break-words leading-snug">
                      {o.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0">
            <FieldLabel>Kurzer Teaser</FieldLabel>
            <textarea
              required
              value={teaser}
              onChange={(e) => setTeaser(e.target.value)}
              rows={2}
              className={inputBase}
            />
          </div>

          <div className="min-w-0">
            <FieldLabel>Beschreibung</FieldLabel>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className={inputBase}
            />
          </div>

          <MultiChipInput
            label="Aufgaben"
            suggestions={suggestions.responsibilities}
            value={responsibilities}
            onChange={setResponsibilities}
            placeholder="Aufgabe hinzufügen…"
          />
          <MultiChipInput
            label="Profil"
            suggestions={suggestions.qualifications}
            value={qualifications}
            onChange={setQualifications}
            placeholder="Anforderung hinzufügen…"
          />
          <MultiChipInput
            label="Benefits"
            suggestions={suggestions.benefits}
            value={benefits}
            onChange={setBenefits}
            placeholder="Benefit hinzufügen…"
          />

          {/* (Dein bestehendes Gehalt/Start Grid unverändert gelassen) */}
          <div className="grid gap-4 lg:grid-cols-2 min-w-0">
            <div className="min-w-0 order-1">
              <FieldLabel>
                Gehalt <span className="text-xs text-zinc-500">(optional)</span>
              </FieldLabel>

              <div className="mt-1 grid grid-cols-2 gap-2 min-w-0">
                <div className="relative min-w-0">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="Min."
                    className={inputBase + " pr-8"}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    €
                  </span>
                </div>

                <div className="relative min-w-0">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="Max."
                    className={inputBase + " pr-8"}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                    €
                  </span>
                </div>
              </div>
            </div>

            <div className="min-w-0 order-3 lg:order-2">
              <FieldLabel>Start</FieldLabel>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="startsAsap"
                  type="checkbox"
                  checked={startsAsap}
                  onChange={(e) => setStartsAsap(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="startsAsap" className="text-sm">
                  Ab sofort
                </label>
              </div>
            </div>

            <div className="min-w-0 order-2 lg:order-3">
              <div className="sr-only" id="salaryUnitLabel">
                Gehaltseinheit
              </div>
              <SelectBox
                aria-labelledby="salaryUnitLabel"
                value={
                  salaryUnit === "HOUR"
                    ? "pro Stunde"
                    : salaryUnit === "MONTH"
                      ? "pro Monat"
                      : "pro Jahr"
                }
                onChange={(v) =>
                  setSalaryUnit(
                    v === "pro Stunde"
                      ? "HOUR"
                      : v === "pro Monat"
                        ? "MONTH"
                        : "YEAR"
                  )
                }
                options={["pro Stunde", "pro Monat", "pro Jahr"]}
              />
            </div>

            <div className="min-w-0 order-4 lg:order-4">
              <div className="sr-only" id="startDateLabel">
                Startdatum
              </div>
              <input
                aria-labelledby="startDateLabel"
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                disabled={startsAsap}
                className={[inputBase, startsAsap ? dateDisabledClass : ""].join(
                  " "
                )}
              />
            </div>

            <div className="min-w-0">
              <FieldLabel>
                Schicht / Zeiten{" "}
                <span className="text-xs text-zinc-500">(optional)</span>
              </FieldLabel>
              <input
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className={inputBase}
                placeholder='z.B. "Frühschicht"'
              />
            </div>

            <div className="min-w-0">
              <FieldLabel>
                Zusatzinfo <span className="text-xs text-zinc-500">(optional)</span>
              </FieldLabel>
              <input
                value={workloadNote}
                onChange={(e) => setWorkloadNote(e.target.value)}
                className={inputBase}
                placeholder='z.B. "Wochenenden im Wechsel"'
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 min-w-0">
            <div className="min-w-0">
              <FieldLabel>
                Bewerbungs-E-Mail{" "}
                <span className="text-xs text-zinc-500">(optional)</span>
              </FieldLabel>
              <input
                value={applyEmail}
                onChange={(e) => setApplyEmail(e.target.value)}
                className={inputBase}
                placeholder={DEFAULT_APPLY_EMAIL}
              />
            </div>

            <div className="min-w-0">
              <FieldLabel>
                Bewerbungs-URL{" "}
                <span className="text-xs text-zinc-500">(optional)</span>
              </FieldLabel>
              <input
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                className={inputBase}
                placeholder="https://…"
              />
            </div>

            <div className="min-w-0">
              <FieldLabel>
                Telefon für Rückfragen{" "}
                <span className="text-xs text-zinc-500">(optional)</span>
              </FieldLabel>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={inputBase}
                placeholder="+49 …"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className="text-sm">
              Aktiv erstellen{" "}
              <span className="text-xs text-zinc-500">(optional)</span>
            </label>
          </div>

          {/* ✅ Footer: "Schließen" neben "Stelle anlegen" */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2">
            <button
              type="button"
              onClick={closeAndKeepView}
              className={secondaryBtn}
            >
              Schließen
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl
                bg-gradient-to-r from-emerald-600 to-emerald-700
                px-4 py-2.5 text-sm font-semibold text-white
                shadow-lg shadow-emerald-600/20 transition
                hover:from-emerald-700 hover:to-emerald-800
                active:translate-y-[1px] active:shadow-md
                focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Speichert…" : "Stelle anlegen"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
