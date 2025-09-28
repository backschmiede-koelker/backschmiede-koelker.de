// File: /app/components/animations/in-view.tsx
"use client";

/**
 * in-view.tsx
 * ----------------------------------------------------------------------------
 * High-Level-Komponenten für wiederverwendbare Scroll-Animationen (Motion).
 * Baut auf use-visibility.ts auf (Hysterese + Debounce + Replay).
 *
 * Komponenten
 *  - InViewReveal<T>:   Umhüllt beliebigen Inhalt, blendet beim Eintritt ein,
 *                       beim Verlassen wieder aus (Replay). Polymorph via `as`.
 *  - StaggerContainer:  Gruppiert Kinder und animiert sie gestaffelt.
 *  - StaggerItem:       Einzelnes Kind eines StaggerContainers.
 *
 * WICHTIG (TypeScript / Refs):
 *  - Wenn du ein konkretes HTML-Element rendert (z. B. m.div), sollte der Ref-Typ
 *    zu diesem Element passen (HTMLDivElement). Daher erzwingen wir in
 *    StaggerContainer ein `useVisibility<HTMLDivElement>(…)`.
 *  - InViewReveal ist polymorph (beliebiges `as`), daher verwenden wir einen
 *    generischen Typparameter <T extends HTMLElement = HTMLDivElement> und übergeben
 *    den Ref typ-sicher weiter. Bei sehr exotischen Polymorphismen casten wir am
 *    Ende schmal auf `any`, weil Motion’s Typen selbst polymorph sind und oft
 *    nicht alle Fälle exakt abbilden (das ist üblich in Motion-Komponenten).
 *
 * Schnelleinstieg:
 *  import { InViewReveal, StaggerContainer, StaggerItem } from "@/app/components/animations";
 *
 *  // 1) Einfacher Fade/Slide-In (Replay: ausblenden erst wenn komplett raus):
 *  <InViewReveal y={24} visibility={{ amountEnter: 0.1, amountLeave: 0 }}>
 *    <h2>Section</h2>
 *    <p>Inhalt…</p>
 *  </InViewReveal>
 *
 *  // 2) Gestaffelte Kinder:
 *  <StaggerContainer>
 *    <StaggerItem><Card …/></StaggerItem>
 *    <StaggerItem><Card …/></StaggerItem>
 *    <StaggerItem><Card …/></StaggerItem>
 *  </StaggerContainer>
 *
 *  // 3) Einmalig anzeigen (kein Replay):
 *  <InViewReveal visibility={{ once: true }}>…</InViewReveal>
 * ----------------------------------------------------------------------------
 */

import React, { HTMLAttributes, Ref } from "react";
import { motion as m, useAnimationControls } from "motion/react";
import { useVisibility, UseVisibilityOptions } from "./use-visibility";

type BaseProps = {
  as?: any;                     // polymorphes Element, z. B. m.section, m.article …
  children: React.ReactNode;
  className?: string;

  // visuelle Defaults für einen soften "Slide-Up"
  y?: number;                   // Start-Offset Y
  opacityFrom?: number;         // Start-Opacity
  delay?: number;
  duration?: number;
  ease?: any;

  // Sichtbarkeitslogik
  visibility?: UseVisibilityOptions;
} & HTMLAttributes<HTMLElement>;

/**
 * InViewReveal
 * - Polymorphe Reveal-Section mit Replay, basierend auf useVisibility.
 * - Generisch über <T> typisiert, damit der Ref-Typ zu deinem DOM-Element passt.
 * - Default <T> ist HTMLDivElement (für m.div).
 *
 * Verwendung:
 *  <InViewReveal>…</InViewReveal>                 // rendert m.div (Ref: HTMLDivElement)
 *  <InViewReveal as={m.section}>…</InViewReveal>  // rendert m.section (Ref: HTMLDivElement-kompatibel)
 *
 * Falls du einen ganz anderen Host-Tag willst und TS extrem streng ist:
 *  <InViewReveal<HTMLElement> as={m.section}>…</InViewReveal>
 */
export function InViewReveal<T extends HTMLElement = HTMLDivElement>({
  as: Component = m.div,
  children,
  className,
  y = 24,
  opacityFrom = 0,
  delay = 0,
  duration = 0.55,
  ease = "easeOut",
  visibility,
  ...rest
}: BaseProps) {
  const controls = useAnimationControls();

  // Generisch getypter Hook: Ref-Typ passt zu <T>
  const { ref, isVisible } = useVisibility<T>(
    visibility ?? {
      amountEnter: 0.08,
      amountLeave: 0.0, // => erst ausblenden, wenn komplett draußen
      rootMargin: "0px 0px 0px 0px",
      debounceMs: 80,
      once: false,
    }
  );

  React.useEffect(() => {
    if (isVisible) controls.start("show");
    else controls.start("hidden");
  }, [isVisible, controls]);

  const variants = React.useMemo(
    () => ({
      hidden: { opacity: opacityFrom, y },
      show: { opacity: 1, y: 0 },
    }),
    [opacityFrom, y]
  );

  // Hinweis: Da `Component` polymorph sein kann, casten wir den Ref schmal auf `Ref<any>`.
  // Für Standardfälle (m.div etc.) passt der konkrete Typ ohnehin (HTMLDivElement).
  const forwardedRef = ref as unknown as Ref<any>;

  return (
    <Component
      ref={forwardedRef}
      className={className}
      variants={variants}
      initial="hidden"
      animate={controls}
      transition={{ duration, ease, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * StaggerContainer
 * - Gruppiert Kinder und animiert sie gestaffelt (Replay-fähig).
 * - Wir wissen, dass hier ein <m.div> gerendert wird → Ref ist HTMLDivElement.
 *   => useVisibility<HTMLDivElement>(…) verhindert TS-Fehler:
 *      "RefObject<Element> is not assignable to Ref<HTMLDivElement>"
 */
export function StaggerContainer({
  children,
  className,
  gap = 0.08,
  delayChildren = 0.05,
  visibility,
}: {
  children: React.ReactNode;
  className?: string;
  gap?: number;            // zeitlicher Abstand zwischen Kindern
  delayChildren?: number;  // Start-Verzögerung für das erste Kind
  visibility?: UseVisibilityOptions;
}) {
  const controls = useAnimationControls();

  // Explizit auf HTMLDivElement typisieren, weil wir unten <m.div> rendern:
  const { ref, isVisible } = useVisibility<HTMLDivElement>(
    visibility ?? {
      amountEnter: 0.1,
      amountLeave: 0.0,
      rootMargin: "0px 0px 0px 0px",
      debounceMs: 80,
      once: false,
    }
  );

  React.useEffect(() => {
    if (isVisible) controls.start("show");
    else controls.start("hidden");
  }, [isVisible, controls]);

  return (
    <m.div
      ref={ref} // passt jetzt exakt: Ref<HTMLDivElement>
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ staggerChildren: gap, delayChildren }}
    >
      {children}
    </m.div>
  );
}

/**
 * StaggerItem
 * - Einzelnes Item für StaggerContainer.
 * - Keine Ref-Probleme, da hier kein externer Ref genutzt wird.
 */
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
