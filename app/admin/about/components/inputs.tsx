// app/admin/about/components/inputs.tsx
"use client";

import * as React from "react";

const base =
  "w-full rounded-xl border px-3 py-2 text-sm shadow-sm transition " +
  "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 " +
  "hover:bg-zinc-50 hover:border-zinc-400 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:border-emerald-500 " +
  "dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 " +
  "dark:hover:bg-zinc-900 dark:hover:border-zinc-600 " +
  "dark:focus-visible:ring-emerald-400/25 dark:focus-visible:border-emerald-400";

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
    <label className="inline-flex items-center gap-2 text-sm text-zinc-900 dark:text-zinc-100">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
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
  variant?: "primary" | "ghost" | "danger" | "softDanger" | "softSuccess";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const btnBase = "inline-flex items-center justify-center whitespace-nowrap h-10";

  const cls =
    variant === "primary"
      ? `
        ${btnBase}
        rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white shadow-sm
        hover:bg-emerald-700 active:scale-[0.99]
        dark:bg-emerald-500/90 dark:hover:bg-emerald-500
        disabled:opacity-60 disabled:cursor-not-allowed
      `
      : variant === "danger"
      ? `
        ${btnBase}
        rounded-xl border border-red-500/50 bg-white px-3 py-2 text-sm text-red-700
        hover:bg-red-50 active:scale-[0.99]
        dark:bg-transparent dark:text-red-200 dark:border-red-500/30 dark:hover:bg-red-950/40
        disabled:opacity-60 disabled:cursor-not-allowed
      `
      : variant === "softDanger"
      ? `
        ${btnBase}
        rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-sm text-red-800
        hover:bg-red-100/60 hover:border-red-300 active:scale-[0.99]
        dark:border-red-500/20 dark:bg-red-950/15 dark:text-red-100
        dark:hover:bg-red-950/25 dark:hover:border-red-500/30
        disabled:opacity-60 disabled:cursor-not-allowed
      `
      : variant === "softSuccess"
      ? `
        ${btnBase}
        rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-900
        hover:bg-emerald-100/60 hover:border-emerald-300 active:scale-[0.99]
        dark:border-emerald-500/20 dark:bg-emerald-950/15 dark:text-emerald-100
        dark:hover:bg-emerald-950/25 dark:hover:border-emerald-500/30
        disabled:opacity-60 disabled:cursor-not-allowed
      `
      : `
        ${btnBase}
        rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm
        hover:bg-zinc-100 hover:border-zinc-400 active:scale-[0.99]
        dark:border-zinc-700/80 dark:bg-zinc-900/60 dark:text-zinc-100
        dark:hover:bg-zinc-800/70 dark:hover:border-zinc-600/90
        disabled:opacity-60 disabled:cursor-not-allowed
      `;

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
