"use client";

import * as React from "react";
import { Button } from "./inputs";

export default function SectionBox({
  title,
  right,
  children,
  collapsible = false,
  defaultOpen = false,
  summary,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  summary?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <section
      className="
        rounded-2xl border border-zinc-200/70 bg-white/80 shadow-sm
        dark:border-zinc-800/80 dark:bg-zinc-950/40
        p-4 md:p-5
      "
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>

        <div className="flex items-center gap-2">
          {right}
          {collapsible && (
            <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
              {open ? "Schließen" : "Öffnen"}
            </Button>
          )}
        </div>
      </div>

      {!open && summary ? <div className="mt-3">{summary}</div> : null}
      {(!collapsible || open) && <div className="mt-4">{children}</div>}
    </section>
  );
}
