// app/components/ui/section-card.tsx
import React from "react";

export default function SectionCard({
  children,
  className,
  muted,
}: {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section
      className={[
        "rounded-2xl border p-4 shadow-sm ring-1",
        muted
          ? "bg-white/70 ring-black/5 dark:bg-zinc-900/60 dark:ring-white/10"
          : "bg-white/90 ring-black/5 dark:bg-zinc-900/80 dark:ring-white/10",
        className || "",
      ].join(" ")}
    >
      {children}
    </section>
  );
}
