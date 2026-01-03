"use client";

import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa6";

export default function AdminPageHeader({
  title,
  subtitle,
  backHref = "/admin",
  backLabel = "Zur Übersicht",
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="mb-4 md:mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm shadow-sm
                       hover:bg-zinc-50 transition
                       dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <FaChevronLeft className="opacity-80" />
            {backLabel}
          </Link>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>

          {subtitle ? (
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
