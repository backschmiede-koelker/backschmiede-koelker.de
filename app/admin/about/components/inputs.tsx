// app/admin/about/components/inputs.tsx
"use client";

import * as React from "react";

const base =
  "w-full rounded-xl border px-3 py-2 text-sm shadow-sm transition " +
  "border-zinc-200 bg-white/80 hover:bg-white " +
  "dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-900";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className || ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${base} min-h-[90px] ${props.className || ""}`} />;
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const cls =
    variant === "primary"
      ? "rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white shadow hover:bg-emerald-700 disabled:opacity-60"
      : variant === "danger"
      ? "rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-950/30 disabled:opacity-60"
      : "rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 disabled:opacity-60";

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
