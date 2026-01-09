// app/hooks/use-events.tsx
"use client";

import { useEffect, useState } from "react";
import type { EventItem } from "@/app/types/event";

export function useEvents(opts?: { includeInactive?: boolean; order?: "asc" | "desc" }) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reload() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set("order", opts?.order ?? "desc");
      if (!opts?.includeInactive) sp.set("active", "1");

      const res = await fetch(`/api/events?${sp.toString()}`, { cache: "no-store" });
      const data: EventItem[] = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Wirklich löschen?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    await reload();
  }

  return { items, loading, reload, remove };
}
