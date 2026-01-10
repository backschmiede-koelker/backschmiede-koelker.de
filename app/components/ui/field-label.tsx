// app/components/ui/field-label.tsx
import React from "react";

type Props = {
  children: React.ReactNode;
  hint?: string;
  className?: string;
};

export default function FieldLabel({ children, hint, className }: Props) {
  return (
    <label className={`block text-sm font-medium ${className || ""}`}>
      <span>{children}</span>
      {hint ? (
        <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
