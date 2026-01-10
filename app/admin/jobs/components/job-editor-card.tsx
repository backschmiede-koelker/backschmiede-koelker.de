// app/admin/jobs/components/job-editor-card.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import type {
  Job,
  JobCategory,
  JobEmploymentType,
  JobLocation,
  JobSalaryUnit,
} from "@/app/lib/jobs/types";
import {
  categoryLabel,
  employmentLabel,
  locationLabel,
  startLabel,
  sortEmploymentTypes,
} from "@/app/components/jobs/formatters";
import SelectBox from "@/app/components/select-box";
import MultiChipInput from "./multi-chip-input";
import FieldLabel from "@/app/components/ui/field-label";
import { JOB_PRESETS } from "./presets";
import { TAG_SUGGESTIONS } from "./tag-suggestions";

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean)));
}

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

const EMPLOYMENT: { value: JobEmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Vollzeit" },
  { value: "PART_TIME", label: "Teilzeit" },
  { value: "MINI_JOB", label: "Minijob" },
  { value: "APPRENTICESHIP", label: "Ausbildung" },
];

function centsToInput(v?: number | null) {
  if (!v) return "";
  return (v / 100).toLocaleString("de-DE");
}

function toCentsFromInput(v: string) {
  const s = v
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.round(n * 100));
}

function toIntOrZero(v: string) {
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

export default function JobEditorCard({
  job,
  onSaved,
  onDelete,
}: {
  job: Job;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [isActive, setIsActive] = useState(job.isActive);

  const cardRef = useRef<HTMLLIElement | null>(null);

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

  const [title, setTitle] = useState(job.title);
  const [category, setCategory] = useState<JobCategory>(job.category);
  const [teaser, setTeaser] = useState(job.teaser);
  const [description, setDescription] = useState(job.description);

  const [priority, setPriority] = useState<number>(job.priority ?? 0);

  const [employmentTypes, setEmploymentTypes] = useState<JobEmploymentType[]>(
    job.employmentTypes
  );
  const [locations, setLocations] = useState<JobLocation[]>(job.locations);

  const [responsibilities, setResponsibilities] = useState<string[]>(
    job.responsibilities ?? []
  );
  const [qualifications, setQualifications] = useState<string[]>(
    job.qualifications ?? []
  );
  const [benefits, setBenefits] = useState<string[]>(job.benefits ?? []);

  const [salaryMin, setSalaryMin] = useState(centsToInput(job.salaryMinCents));
  const [salaryMax, setSalaryMax] = useState(centsToInput(job.salaryMaxCents));
  const [salaryUnit, setSalaryUnit] = useState<JobSalaryUnit>(
    (job.salaryUnit ?? "MONTH") as JobSalaryUnit
  );

  const [shift, setShift] = useState(job.shift ?? "");
  const [workloadNote, setWorkloadNote] = useState(job.workloadNote ?? "");

  const [startsAsap, setStartsAsap] = useState(job.startsAsap);
  const [startsAt, setStartsAt] = useState(
    job.startsAt ? new Date(job.startsAt).toISOString().slice(0, 10) : ""
  );

  const [applyEmail, setApplyEmail] = useState(job.applyEmail ?? "");
  const [applyUrl, setApplyUrl] = useState(job.applyUrl ?? "");
  const [contactPhone, setContactPhone] = useState(job.contactPhone ?? "");

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

  const secondaryBtn =
    "inline-flex items-center justify-center rounded-xl " +
    "border border-zinc-300/90 bg-white/80 px-3 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition " +
    "hover:bg-zinc-50 hover:shadow active:translate-y-[1px] " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 " +
    "dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800/60";

  function closeAndKeepView() {
    const el = cardRef.current;
    const topBefore = el ? el.getBoundingClientRect().top + window.scrollY : null;

    setOpen(false);

    requestAnimationFrame(() => {
      if (topBefore == null) return;
      window.scrollTo({ top: Math.max(0, topBefore - 100), behavior: "smooth" });
    });
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

  async function toggleActive() {
    if (togglingActive) return;
    setTogglingActive(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setIsActive((v) => !v);
      await onSaved();
    } catch (e) {
      console.error(e);
      alert("Aktiv-Status ändern fehlgeschlagen.");
    } finally {
      setTogglingActive(false);
    }
  }

  async function save() {
    if (saving) return;
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

      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
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
          shift: shift.trim() || null,
          workloadNote: workloadNote.trim() || null,
          startsAsap,
          startsAt: startsAsap ? null : startsAt || null,
          applyEmail: applyEmail.trim() || null,
          applyUrl: applyUrl.trim() || null,
          contactPhone: contactPhone.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      await onSaved();
    } catch (e) {
      console.error(e);
      alert("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  const listEmploymentSorted = sortEmploymentTypes(job.employmentTypes);

  return (
    <li ref={cardRef} className="rounded-2xl border border-zinc-300/80 bg-white/90 dark:border-white/10 dark:bg-white/5 p-4 sm:p-5 shadow-md shadow-zinc-900/10 ring-1 ring-zinc-900/10 dark:shadow-none dark:ring-0 min-w-0 overflow-x-hidden">
      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight leading-snug min-w-0 truncate">
                {job.title}
              </h3>

              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] ring-1 font-semibold",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-zinc-100 text-zinc-700 ring-zinc-300",
                  isActive
                    ? "dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-700"
                    : "dark:bg-zinc-800/50 dark:text-zinc-200 dark:ring-zinc-700",
                ].join(" ")}
              >
                {isActive ? "Aktiv" : "Inaktiv"}
              </span>

              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] ring-1 font-semibold
                  bg-amber-50 text-amber-900 ring-amber-200
                  dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-700"
                title="Priorität (höher = weiter oben)"
              >
                Prio: {job.priority ?? 0}
              </span>
            </div>

            <p className="mt-1 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
              {job.teaser}
            </p>

            <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              {categoryLabel(job.category)} ·{" "}
              {job.locations.map(locationLabel).join(" · ")} · {startLabel(job)}
            </p>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px] min-w-0 px-1 py-1 overflow-visible">
              {listEmploymentSorted.map((t) => (
                <span
                  key={t}
                  className="inline-flex max-w-full min-w-0 items-center rounded-full border border-zinc-300/80 px-2.5 py-1 bg-white/80
                    dark:border-white/10 dark:bg-zinc-900/50"
                >
                  <span className="min-w-0 truncate">
                    💼 {employmentLabel(t)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={secondaryBtn}
          >
            {open ? "Schließen" : "Bearbeiten"}
          </button>

          <button
            type="button"
            onClick={toggleActive}
            disabled={togglingActive}
            className={
              secondaryBtn + " disabled:opacity-60 disabled:cursor-not-allowed"
            }
          >
            {togglingActive
              ? "Bitte warten…"
              : isActive
                ? "Deaktivieren"
                : "Aktivieren"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex w-full items-center justify-center rounded-xl
              border border-red-200 bg-red-50/70 px-3 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition
              hover:bg-red-100 hover:shadow active:translate-y-[1px]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30
              dark:border-red-400/20 dark:bg-red-900/15 dark:text-red-200 dark:hover:bg-red-900/25"
          >
            Löschen
          </button>
        </div>

        {open && (
          <div className="mt-2 border-t border-zinc-200/70 dark:border-white/10 pt-4 space-y-4 min-w-0">
            <div className="grid gap-4 lg:grid-cols-2 min-w-0">
              <div className="min-w-0">
                <FieldLabel>Titel</FieldLabel>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputBase}
                />
              </div>

              <div className="min-w-0">
                <FieldLabel>Bereich</FieldLabel>
                <div className="mt-1">
                  <SelectBox
                    value={
                      CATEGORY_OPTIONS.find((o) => o.value === category)
                        ?.label || "Sonstiges"
                    }
                    onChange={(label) => {
                      const found = CATEGORY_OPTIONS.find(
                        (o) => o.label === label
                      );
                      if (found) setCategory(found.value);
                    }}
                    options={CATEGORY_OPTIONS.map((o) => o.label)}
                  />
                </div>
              </div>

              <div className="min-w-0 lg:col-span-2">
                <FieldLabel>Priorität</FieldLabel>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(toIntOrZero(e.target.value))}
                  className={inputBase + " mt-1"}
                />
              </div>
            </div>

            <div className="min-w-0">
              <FieldLabel>Kurzer Teaser</FieldLabel>
              <textarea
                value={teaser}
                onChange={(e) => setTeaser(e.target.value)}
                rows={2}
                className={inputBase}
              />
            </div>

            <div className="min-w-0">
              <FieldLabel>Beschreibung</FieldLabel>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className={inputBase}
              />
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

            <MultiChipInput
              label="Aufgaben"
              suggestions={suggestions.responsibilities}
              value={responsibilities}
              onChange={setResponsibilities}
            />
            <MultiChipInput
              label="Profil"
              suggestions={suggestions.qualifications}
              value={qualifications}
              onChange={setQualifications}
            />
            <MultiChipInput
              label="Benefits"
              suggestions={suggestions.benefits}
              value={benefits}
              onChange={setBenefits}
            />

            {/* ✅ Wie im New-Form: Einheit + Datum auf lg in gleicher Zeile */}
            <div className="grid gap-4 lg:grid-cols-2 min-w-0">
              {/* Gehalt (inputs) */}
              <div className="min-w-0 order-1">
                <FieldLabel>
                  Gehalt{" "}
                  <span className="text-xs text-zinc-500">(optional)</span>
                </FieldLabel>
                <div className="mt-1 grid grid-cols-2 gap-2 min-w-0">
                  <input
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className={inputBase}
                    placeholder="Min."
                  />
                  <input
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className={inputBase}
                    placeholder="Max."
                  />
                </div>
              </div>

              {/* Start (Checkbox) */}
              <div className="min-w-0 order-3 lg:order-2">
                <FieldLabel>Start</FieldLabel>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id={`startsAsap-${job.id}`}
                    type="checkbox"
                    checked={startsAsap}
                    onChange={(e) => setStartsAsap(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`startsAsap-${job.id}`} className="text-sm">
                    Ab sofort
                  </label>
                </div>
              </div>

              {/* Einheit (links) */}
              <div className="min-w-0 order-2 lg:order-3">
                <div className="sr-only" id={`salaryUnitLabel-${job.id}`}>
                  Gehaltseinheit
                </div>
                <SelectBox
                  aria-labelledby={`salaryUnitLabel-${job.id}`}
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

              {/* Datum (rechts) */}
              <div className="min-w-0 order-4 lg:order-4">
                <div className="sr-only" id={`startDateLabel-${job.id}`}>
                  Startdatum
                </div>
                <input
                  aria-labelledby={`startDateLabel-${job.id}`}
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  disabled={startsAsap}
                  className={[
                    inputBase,
                    startsAsap ? dateDisabledClass : "",
                  ].join(" ")}
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
                />
              </div>

              <div className="min-w-0">
                <FieldLabel>
                  Zusatzinfo{" "}
                  <span className="text-xs text-zinc-500">(optional)</span>
                </FieldLabel>
                <input
                  value={workloadNote}
                  onChange={(e) => setWorkloadNote(e.target.value)}
                  className={inputBase}
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
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeAndKeepView}
                className={secondaryBtn}
              >
                Schließen
              </button>

              <button
                type="button"
                onClick={save}
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
                {saving ? "Speichert…" : "Änderungen speichern"}
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
