// app/admin/about/components/dnd/use-sortable-list.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SortableBase = { id: string; sortOrder: number };

export function useSortableList<T extends SortableBase>({
  items,
  onReorderPersist,
}: {
  items: T[];
  onReorderPersist: (next: { id: string; sortOrder: number }[]) => Promise<void>;
}) {
  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)
      ),
    [items]
  );

  const [localOrder, setLocalOrder] = useState<T[]>(sortedItems);

  useEffect(() => {
    setLocalOrder(sortedItems);
  }, [sortedItems]);

  const dragIdRef = useRef<string | null>(null);
  const lastTargetIndexRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  function reorderPreview(draggedId: string, targetIndex: number) {
    const ids = localOrder.map((x) => x.id);
    const from = ids.indexOf(draggedId);
    if (from < 0) return;

    const clampedTarget = Math.max(0, Math.min(targetIndex, ids.length));
    const insertAt = from < clampedTarget ? clampedTarget - 1 : clampedTarget;

    // no-op → nicht neu setzen (verhindert Jitter / unnötiges Re-render)
    if (insertAt === from) return;

    const next = localOrder.slice();
    const [moved] = next.splice(from, 1);
    next.splice(insertAt, 0, moved);

    setLocalOrder(next);
  }

  async function persistCurrentOrder() {
    const next = localOrder.map((it, idx) => ({ id: it.id, sortOrder: idx }));
    await onReorderPersist(next);
  }

  function bindDragHandle(id: string) {
    return {
      draggable: true as const,
      onDragStart: (e: React.DragEvent) => {
        dragIdRef.current = id;
        lastTargetIndexRef.current = null;
        isDraggingRef.current = true;

        try {
          e.dataTransfer.setData("text/plain", id);
          e.dataTransfer.effectAllowed = "move";
        } catch {}
      },
      onDragEnd: () => {
        dragIdRef.current = null;
        lastTargetIndexRef.current = null;
        isDraggingRef.current = false;
      },
    };
  }

  function bindDropTarget(id: string) {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        const dragId = dragIdRef.current;
        if (!dragId || dragId === id) return;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const isTopHalf = y < rect.height / 2;

        const ids = localOrder.map((x) => x.id);
        const overIndex = ids.indexOf(id);
        if (overIndex < 0) return;

        const targetIndex = isTopHalf ? overIndex : overIndex + 1;

        if (lastTargetIndexRef.current === targetIndex) return;
        lastTargetIndexRef.current = targetIndex;

        reorderPreview(dragId, targetIndex);
      },
      onDrop: async (e: React.DragEvent) => {
        e.preventDefault();
        if (!isDraggingRef.current) return;
        await persistCurrentOrder();
        dragIdRef.current = null;
        lastTargetIndexRef.current = null;
        isDraggingRef.current = false;
      },
    };
  }

  return {
    items: localOrder,
    bindDragHandle,
    bindDropTarget,
    persistCurrentOrder,
    setLocalOrder,
  };
}
