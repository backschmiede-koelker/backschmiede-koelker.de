// app/admin/about/components/dnd/reorder-header.tsx
"use client";

import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";

export default function ReorderHeader({
  disabled,
  isFirst,
  isLast,
  bindDragHandle,
  onUp,
  onDown,
  leftMeta,
}: {
  disabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  bindDragHandle: React.HTMLAttributes<HTMLDivElement>;
  onUp: () => void;
  onDown: () => void;
  leftMeta?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <div
          {...bindDragHandle}
          className="
            cursor-grab active:cursor-grabbing select-none rounded-lg p-2
            border border-zinc-200 bg-zinc-50 hover:bg-zinc-100
            dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/70
          "
          title="Ziehen"
        >
          <GripVertical size={18} />
        </div>

        {leftMeta ? <div className="min-w-0">{leftMeta}</div> : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || isFirst}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUp();
          }}
          className="
            w-10 h-10 flex items-center justify-center rounded-lg
            border border-zinc-200 bg-white hover:bg-zinc-50
            dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/70
            disabled:opacity-30 disabled:cursor-not-allowed
          "
          title="Nach oben"
        >
          <ArrowUp size={16} />
        </button>

        <button
          type="button"
          disabled={disabled || isLast}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDown();
          }}
          className="
            w-10 h-10 flex items-center justify-center rounded-lg
            border border-zinc-200 bg-white hover:bg-zinc-50
            dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/70
            disabled:opacity-30 disabled:cursor-not-allowed
          "
          title="Nach unten"
        >
          <ArrowDown size={16} />
        </button>
      </div>
    </div>
  );
}
