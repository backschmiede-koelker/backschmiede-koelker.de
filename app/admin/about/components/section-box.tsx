// app/admin/about/components/section-box.tsx
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
    <section className="admin-surface admin-pad min-w-0 mb-4 md:mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
        <h2 className="text-sm font-semibold min-w-0">{title}</h2>

        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {right}
          {collapsible && (
            <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
              {open ? "Schließen" : "Öffnen"}
            </Button>
          )}
        </div>
      </div>

      {!open && summary ? <div className="mt-3 min-w-0">{summary}</div> : null}
      {(!collapsible || open) && <div className="mt-4 min-w-0">{children}</div>}
    </section>
  );
}
