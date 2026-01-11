// app/admin/jobs/use-jobs.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Job } from "@/app/lib/jobs/types";

type JobResponse = Omit<Job, "datePosted" | "validThrough" | "startsAt"> & {
  datePosted: string;
  validThrough?: string | null;
  startsAt?: string | null;
};

export function useJobs() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs?admin=1", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = (await res.json()) as { items?: JobResponse[] };

      const parsed: Job[] = (data.items ?? []).map((j) => ({
        ...j,
        datePosted: new Date(j.datePosted),
        validThrough: j.validThrough ? new Date(j.validThrough) : null,
        startsAt: j.startsAt ? new Date(j.startsAt) : null,
      }));

      setItems(parsed);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function remove(id: string) {
    if (!window.confirm("Stellenanzeige wirklich löschen?")) return;
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Löschen fehlgeschlagen.");
      return;
    }
    await reload();
  }

  return { items, loading, reload, remove };
}
