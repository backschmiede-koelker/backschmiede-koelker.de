// /app/hooks/use-news.tsx
"use client";
import { useEffect, useState } from "react";
import { News } from "../types/news";

export function useNews() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { reload(); }, []);

  async function reload() {
    setLoading(true);
    try {
      const res = await fetch("/api/news?limit=100", { cache: "no-store" });
      const data: News[] = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Wirklich löschen?")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    await reload();
  }

  return { items, loading, reload, remove };
}
