// /app/admin/analytics/filters.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FaInfoCircle } from "react-icons/fa";

type Props = {
  initial: {
    range: string;
  };
};

export default function AnalyticsFilters({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [range, setRange] = useState(initial.range ?? "30d");

  function apply() {
    const q = new URLSearchParams();
    q.set("range", range);
    startTransition(() => router.push(`/admin/analytics?${q.toString()}`));
  }

  function resetAll() {
    setRange("30d");
    startTransition(() => router.push(`/admin/analytics?range=30d`));
  }

  return (
    <div className="relative z-10 overflow-visible rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-4 shadow-sm">
      <div className="flex items-start gap-2 mb-3">
        <h2 className="text-sm font-semibold">Filter</h2>
        <div className="text-xs opacity-80 flex items-center gap-1">
          <FaInfoCircle />
          <span>Zeitraum wählen (max. 12 Monate).</span>
        </div>
      </div>

      {/* Zeiträume */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip label="7 Tage" active={range === "7d"} onClick={() => setRange("7d")} />
        <Chip label="30 Tage" active={range === "30d"} onClick={() => setRange("30d")} />
        <Chip label="90 Tage" active={range === "90d"} onClick={() => setRange("90d")} />
        <Chip label="365 Tage" active={range === "365d"} onClick={() => setRange("365d")} />
      </div>

      {/* Buttons */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          onClick={apply}
          disabled={isPending}
          className={[
            "w-full rounded-xl px-4 py-2.5 text-white font-semibold shadow-sm transition",
            isPending ? "bg-emerald-400 cursor-wait" : "bg-emerald-600 hover:bg-emerald-500",
          ].join(" ")}
        >
          {isPending ? "Filter werden angewendet." : "Filter anwenden"}
        </button>
        <button
          onClick={resetAll}
          disabled={isPending}
          className={[
            "w-full sm:w-auto rounded-xl px-4 py-2.5 font-medium border transition",
            "border-zinc-300/70 dark:border-zinc-700/60",
            "hover:ring-1 hover:ring-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
            "active:scale-[0.98]",
          ].join(" ")}
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-lg text-sm border transition",
        active
          ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200"
          : "border-zinc-300/70 dark:border-zinc-700/60 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
