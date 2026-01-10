// app/components/about/card.tsx
import * as React from "react";

export default function AboutCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-3xl bg-white dark:bg-zinc-900 shadow ring-1 ring-zinc-200/70 dark:ring-zinc-800 p-6 md:p-8",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}
