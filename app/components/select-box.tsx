// /app/components/select-box.tsx
"use client"
import { useEffect, useRef, useState } from "react"

type SelectBoxProps = {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export default function SelectBox({ value, onChange, options, placeholder, disabled, className, ariaLabel }: SelectBoxProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const label = value || placeholder || ""

  return (
    <div ref={ref} className={`relative ${className || ""}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={!!disabled}
        onClick={() => setOpen(o => !o)}
        className={[
          "w-full rounded-md px-3 py-2 text-left ring-1 shadow-sm transition",
          "bg-white ring-zinc-300 hover:bg-zinc-50",
          "dark:bg-zinc-800 dark:ring-zinc-700 dark:hover:bg-zinc-800/70",
          disabled ? "opacity-60 cursor-not-allowed" : ""
        ].join(" ")}
      >
        <span className="block truncate text-zinc-900 dark:text-zinc-100">{label}</span>
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-zinc-500 dark:text-zinc-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full max-w-full overflow-auto rounded-md border bg-white ring-1 ring-zinc-200 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:ring-zinc-700"
        >
          {options.map(opt => {
            const active = opt === value
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={[
                  "block w-full px-3 py-2 text-left text-sm",
                  active
                    ? "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200"
                    : "text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-700/60"
                ].join(" ")}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
