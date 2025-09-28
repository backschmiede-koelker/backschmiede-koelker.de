// app/components/news/controls.tsx
"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  loading: boolean;
  countLabel: string;
};

export function Controls({ onPrev, onNext, loading, countLabel }: Props) {
  // Touch-„Pressed“-State, damit Dark Mode auf Mobil nicht „kleben“ bleibt.
  const [pressed, setPressed] = useState<"prev" | "next" | null>(null);

  const press = useCallback((key: "prev" | "next") => setPressed(key), []);
  const release = useCallback(() => setPressed(null), []);

  const baseBtn =
    "min-w-[56px] rounded-xl border border-zinc-200/60 bg-white/80 px-4 py-2 text-sm shadow-sm " +
    "transition hover:bg-zinc-50 hover:brightness-105 active:brightness-95 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 " +
    "disabled:opacity-40 dark:border-zinc-800/60 dark:bg-white/10 dark:hover:bg-zinc-900/40";

  const pressedClass =
    "[data-pressed=true]:brightness-95 dark:[data-pressed=true]:bg-zinc-900/50 " +
    "[data-pressed=true]:transition-none";

  return (
    <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">
        {loading ? "Lade …" : countLabel}
      </div>

      {/* Auf sehr kleinen Screens linksbündig unter dem Zähler */}
      <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
        <button
          type="button"
          aria-label="Vorherige"
          onClick={onPrev}
          onPointerDown={() => press("prev")}
          onPointerUp={release}
          onPointerCancel={release}
          onPointerLeave={release}
          data-pressed={pressed === "prev"}
          className={`${baseBtn} ${pressedClass}`}
          style={{ touchAction: "manipulation" }}
        >
          <ChevronLeft className="mx-auto h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Nächste"
          onClick={onNext}
          onPointerDown={() => press("next")}
          onPointerUp={release}
          onPointerCancel={release}
          onPointerLeave={release}
          data-pressed={pressed === "next"}
          className={`${baseBtn} ${pressedClass}`}
          style={{ touchAction: "manipulation" }}
        >
          <ChevronRight className="mx-auto h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
