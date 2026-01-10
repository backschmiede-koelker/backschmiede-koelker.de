// app/admin/jobs/components/multi-chip-input.tsx
"use client";

import { useMemo, useState } from "react";

export default function MultiChipInput({
  label,
  optional,
  suggestions,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  optional?: boolean;
  suggestions: string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const sug = useMemo(() => {
    const s = new Set((suggestions || []).map((x) => x.trim()).filter(Boolean));
    value.forEach((v) => s.delete(v));
    return Array.from(s);
  }, [suggestions, value]);

  function addItem(raw: string) {
    const t = raw.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  }

  function removeItem(it: string) {
    onChange(value.filter((x) => x !== it));
  }

  const inputBase =
    "w-full min-w-0 rounded-xl border border-zinc-300/90 px-3 py-2.5 bg-white dark:bg-zinc-900/50 text-sm shadow-sm " +
    "outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500/40 " +
    "dark:border-white/10 dark:text-zinc-100";

  return (
    <div className="space-y-2 min-w-0">
      <div className="text-sm font-semibold">
        {label}{" "}
        {optional ? <span className="text-xs text-zinc-500">(optional)</span> : null}
      </div>

      {/* selected */}
      <div className="flex flex-wrap gap-2 min-w-0">
        {value.map((it) => (
          <button
            key={it}
            type="button"
            onClick={() => removeItem(it)}
            className="inline-flex max-w-full items-start gap-2 rounded-2xl
              px-3 py-2 text-xs ring-1 transition
              bg-emerald-50 ring-emerald-200 text-emerald-950 hover:bg-emerald-100
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30
              active:translate-y-[1px]
              dark:bg-emerald-900/20 dark:ring-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-900/35"
            title="Entfernen"
          >
            {/* ❗️kein truncate -> Umbrechen statt "..." */}
            <span className="whitespace-normal break-words leading-snug">
              {it}
            </span>
            <span className="mt-[1px] shrink-0" aria-hidden>
              ✕
            </span>
          </button>
        ))}

        {value.length === 0 ? (
          <span className="text-xs text-zinc-500">Noch nichts ausgewählt.</span>
        ) : null}
      </div>

      {/* add */}
      <div className="flex flex-col gap-2 sm:flex-row min-w-0">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={inputBase}
          placeholder={placeholder || "Hinzufügen…"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem(draft);
            }
          }}
        />
        <button
          type="button"
          onClick={() => addItem(draft)}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl
            border border-zinc-300/90 bg-white/80 px-3 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm transition
            hover:bg-zinc-50 hover:shadow
            active:translate-y-[1px]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30
            dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800/60"
        >
          + Hinzufügen
        </button>
      </div>

      {/* suggestions */}
      {sug.length > 0 ? (
        <div className="flex flex-wrap gap-2 min-w-0">
          {sug.slice(0, 24).map((it) => (
            <button
              key={it}
              type="button"
              onClick={() => addItem(it)}
              className="inline-flex max-w-full items-start rounded-2xl
                px-3 py-2 text-xs ring-1 transition
                bg-zinc-100 ring-zinc-300 text-zinc-900 hover:bg-zinc-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30
                active:translate-y-[1px]
                dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700/70"
              title={it}
            >
              <span className="whitespace-normal break-words leading-snug">
                {it}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
