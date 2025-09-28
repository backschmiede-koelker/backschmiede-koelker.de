// /app/lib/use-events.ts
"use client";
import { useEffect, useState } from "react";
import type { EventDto } from "../types/events";

export function useEvents() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        const json = (await res.json()) as { events: EventDto[] };
        if (alive) setEvents(json.events ?? []);
      } catch {
        // Fallback: minimale Dummy-Events, falls API nicht läuft
        if (alive)
          setEvents([
            {
              id: "fallback-1",
              title: "Brot & Butter: Frühstück im Laden",
              start: new Date(Date.now() + 86400000).toISOString(),
              end: new Date(Date.now() + 86400000 + 2 * 3600000).toISOString(),
              location: "Hauptstraße 12, 10115 Berlin",
              description: "Herzhaft & süß – hausgemachte Aufstriche, saisonales Obst.",
              category: "Frühstück",
              priceCents: 1500,
              seatsLeft: 8,
            },
          ]);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { events, isLoading };
}
