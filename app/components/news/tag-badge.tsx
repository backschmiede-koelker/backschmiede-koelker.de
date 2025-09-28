// app/components/news/tag-badge.tsx
import React from "react";

export function TagBadge({ tag }: { tag?: string | null }) {
  if (!tag) return null;

  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide " +
    "ring-1 ring-inset max-w-full min-w-0 truncate whitespace-nowrap";
  let styles =
    "bg-slate-500/20 dark:bg-slate-300/20 text-slate-900 dark:text-slate-100 ring-slate-600/35 dark:ring-slate-400/35";

  const t = tag.trim().toLowerCase();
  if (t === "jobs") styles = "bg-amber-500/20 text-amber-900 dark:text-amber-200 ring-amber-600/30";
  else if (t === "aktion") styles = "bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 ring-emerald-600/30";
  else if (t === "event") styles = "bg-teal-500/20 text-teal-900 dark:text-teal-200 ring-teal-600/30";
  else if (t === "info") styles = "bg-sky-500/20 text-sky-900 dark:text-sky-200 ring-sky-600/30";

  return (
    <span className={`${base} ${styles}`} title={tag}>
      {tag}
    </span>
  );
}
