// app/components/about/section-heading.tsx
import * as React from "react";

export default function AboutSectionHeading({
  title,
  subtitle,
  eyebrow,
  as = "h2",
  align = "left",
}: {
  title?: string | null;
  subtitle?: string | null;
  eyebrow?: string | null;
  as?: "h1" | "h2";
  align?: "left" | "center";
}) {
  const isCenter = align === "center";
  const HeadingTag: React.ElementType = as;

  return (
    <header className={["mb-4 md:mb-6", isCenter ? "text-center" : ""].join(" ")}>
      {eyebrow && (
        <span
          className={[
            "mb-2 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
            isCenter ? "mx-auto" : "",
          ].join(" ")}
        >
          {eyebrow}
        </span>
      )}
      {title && (
        <HeadingTag className="text-xl md:text-3xl font-bold tracking-tight">
          {title}
        </HeadingTag>
      )}
      {subtitle && (
        <p
          className={[
            "mt-2 text-sm md:text-base text-zinc-700 dark:text-zinc-300",
            isCenter ? "mx-auto max-w-2xl" : "max-w-prose",
          ].join(" ")}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
