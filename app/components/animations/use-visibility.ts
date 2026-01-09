// File: /app/components/animations/use-visibility.ts
"use client";

/**
 * use-visibility.ts
 * ---------------------------------------------------------------------------
 * Zweck
 *  - Stabiler IntersectionObserver-Hook für Scroll-Animationen mit:
 *    • Hysterese: getrennte Eintritts- (amountEnter) und Austritts-Schwelle (amountLeave)
 *    • Debounce: entprellt Observer-Events gegen Flackern an Grenzpositionen
 *    • Replay: setzt Sichtbarkeit wieder auf false, wenn Element wirklich raus ist
 *
 * TL;DR: Genau das Verhalten, das du wolltest:
 *  - Elemente werden erst ausgeblendet, wenn sie den Viewport KOMPLETT verlassen haben.
 *  - Kein "Zittern/Flackern", wenn man an einer bestimmten Scroll-Position stoppt.
 *
 * Wichtige Optionen
 *  - amountEnter:   Ab welchem sichtbaren Anteil (0..1) gilt "sichtbar"? (z. B. 0.08)
 *  - amountLeave:   Bei welchem Anteil oder darunter gilt "nicht sichtbar"? (z. B. 0.0)
 *                   -> 0.0 bedeutet: erst ausblenden, wenn komplett draußen.
 *  - rootMargin:    Zusätzlicher "Puffer" rund um den Viewport, z. B. "0px 0px -10% 0px".
 *                   In den meisten Fällen brauchst du das mit der Hysterese nicht mehr.
 *  - debounceMs:    Entprell-Zeit in Millisekunden (z. B. 60-120ms).
 *  - once:          true = nur einmal anzeigen, danach nie wieder ausblenden (kein Replay).
 *
 * Verwendung (Beispiel):
 *  const { ref, isVisible } = useVisibility({ amountEnter: 0.1, amountLeave: 0 });
 *  return <div ref={ref} className={isVisible ? "fade-in" : "fade-out"}>...</div>
 *
 * Empfehlung:
 *  - Nutze diesen Hook über die High-Level-Komponenten in in-view.tsx (InViewReveal,
 *    StaggerContainer). Direktverwendung ist nice für Spezialfälle.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useMemo, useRef, useState } from "react";

export type UseVisibilityOptions = {
  root?: Element | null;
  rootMargin?: string;     // z. B. "0px 0px 0px 0px"
  amountEnter?: number;    // 0..1 — ab diesem Anteil gilt "sichtbar"
  amountLeave?: number;    // 0..1 — bei <= diesem Anteil "unsichtbar"
  debounceMs?: number;     // Entprellung der Observer-Events (ms)
  once?: boolean;          // wenn true, bleibt nach erstem Enter sichtbar (kein Replay)
};

export function useVisibility<T extends Element>(
  options: UseVisibilityOptions = {}
) {
  const {
    root = null,
    rootMargin = "0px 0px 0px 0px",
    amountEnter = 0.08,
    amountLeave = 0.0,
    debounceMs = 80,
    once = false,
  } = options;

  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const lockVisible = useRef(false); // für "once"
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mehrere Thresholds erhöhen die Präzision. Wir stellen sicher, dass
  // amountEnter und amountLeave auf jeden Fall enthalten sind.
  const thresholds = useMemo(() => {
    const base = [0, amountLeave, amountEnter, 0.25, 0.5, 0.75, 1]
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort((a, b) => a - b);
    return base;
  }, [amountEnter, amountLeave]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // SSR/no-IO Guard
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const ratio = entry.intersectionRatio;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
          if (lockVisible.current) return;

          // Hysterese: getrennte Ein-/Austritts-Schwellen
          if (ratio >= amountEnter) {
            setIsVisible(true);
            if (once) lockVisible.current = true;
          } else if (ratio <= amountLeave) {
            setIsVisible(false);
          }
        }, debounceMs);
      },
      {
        root,
        rootMargin,
        threshold: thresholds,
      }
    );

    io.observe(el);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      io.disconnect();
    };
  }, [root, rootMargin, thresholds, amountEnter, amountLeave, debounceMs, once]);

  return { ref, isVisible };
}
