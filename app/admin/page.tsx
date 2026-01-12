// app/admin/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  FaListUl,
  FaTag,
  FaChevronRight,
  FaShieldHalved,
  FaPeopleGroup,
  FaRightFromBracket,
  FaChartLine,
  FaNewspaper,
  FaBriefcase,
  FaCalendarDays,
} from "react-icons/fa6";
import { signOut } from "@/auth";
import { WEBSITE_VERSION } from "@/version";

export const metadata: Metadata = {
  title: "Admin | Backschmiede Kölker",
  description: "Produkte, Angebote, News und Analysen für die Backschmiede Kölker zentral verwalten.",
  alternates: { canonical: "/admin" },
  openGraph: {
    title: "Admin | Backschmiede Kölker",
    description: "Produkte, Angebote, News und Analysen für die Backschmiede Kölker zentral verwalten.",
    url: "/admin",
    type: "website",
  },
};

type Accent =
  | "emerald"
  | "amber"
  | "sky"
  | "violet"
  | "rose"
  | "lime"
  | "cyan"
  | "slate";

const ACCENT_STYLES: Record<
  Accent,
  { ring: string; badge: string; iconBg: string; focus: string }
> = {
  emerald: {
    ring: "ring-emerald-600/20 hover:ring-emerald-600/30",
    badge:
      "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20",
    iconBg: "bg-emerald-500/10",
    focus: "focus-visible:ring-emerald-500/50",
  },
  amber: {
    ring: "ring-amber-500/20 hover:ring-amber-500/30",
    badge:
      "bg-amber-600/15 text-amber-700 dark:text-amber-300 ring-amber-600/20",
    iconBg: "bg-amber-500/10",
    focus: "focus-visible:ring-amber-500/50",
  },
  sky: {
    ring: "ring-sky-600/20 hover:ring-sky-600/30",
    badge: "bg-sky-600/15 text-sky-700 dark:text-sky-300 ring-sky-600/20",
    iconBg: "bg-sky-500/10",
    focus: "focus-visible:ring-sky-500/50",
  },
  violet: {
    ring: "ring-violet-600/20 hover:ring-violet-600/30",
    badge:
      "bg-violet-600/15 text-violet-700 dark:text-violet-300 ring-violet-600/20",
    iconBg: "bg-violet-500/10",
    focus: "focus-visible:ring-violet-500/50",
  },
  rose: {
    ring: "ring-rose-600/20 hover:ring-rose-600/30",
    badge:
      "bg-rose-600/15 text-rose-700 dark:text-rose-300 ring-rose-600/20",
    iconBg: "bg-rose-500/10",
    focus: "focus-visible:ring-rose-500/50",
  },
  lime: {
    ring: "ring-lime-600/20 hover:ring-lime-600/30",
    badge:
      "bg-lime-600/15 text-lime-700 dark:text-lime-300 ring-lime-600/20",
    iconBg: "bg-lime-500/10",
    focus: "focus-visible:ring-lime-500/50",
  },
  cyan: {
    ring: "ring-cyan-600/20 hover:ring-cyan-600/30",
    badge:
      "bg-cyan-600/15 text-cyan-700 dark:text-cyan-300 ring-cyan-600/20",
    iconBg: "bg-cyan-500/10",
    focus: "focus-visible:ring-cyan-500/50",
  },
  slate: {
    ring: "ring-slate-600/20 hover:ring-slate-600/30",
    badge:
      "bg-slate-600/15 text-slate-700 dark:text-slate-300 ring-slate-600/20",
    iconBg: "bg-slate-500/10",
    focus: "focus-visible:ring-slate-500/50",
  },
};

function AdminTile({
  href,
  title,
  subtitle,
  Icon,
  accent = "emerald",
}: {
  href: string;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent?: Accent;
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden rounded-2xl",
        "bg-white/80 dark:bg-white/5 backdrop-blur",
        "shadow-sm hover:shadow-md transition-all active:scale-[0.98]",
        "ring-1", styles.ring,
        "focus:outline-none focus-visible:ring-2", styles.focus,
        "p-3.5 sm:p-4 md:p-4 lg:p-5",
      ].join(" ")}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/0 via-white/20 to-white/0 dark:from-white/0 dark:via-white/10 dark:to-white/0" />

      <div
        className={[
          "grid grid-cols-[auto,1fr,auto] items-center gap-3 sm:gap-4",
          "md:grid-rows-[auto_auto] md:gap-y-1",
          "lg:grid-rows-[auto] lg:gap-y-0",
        ].join(" ")}
      >
        <div
          className={[
            "grid place-items-center rounded-xl",
            "border border-black/5 dark:border-white/10",
            styles.iconBg,
            "h-11 w-11 sm:h-12 sm:w-12",
          ].join(" ")}
        >
          <Icon className="text-lg sm:text-xl opacity-90" />
        </div>

        <div className="min-w-0 md:contents lg:block">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 md:col-[2/span_1] md:row-start-1">
            <h3 className="text-sm sm:text-base font-semibold leading-snug">
              {title}
            </h3>
          </div>

          <p
            className={[
              "mt-1 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 break-words",
              "md:col-[1/-1] md:row-start-2 md:mt-0.5",
            ].join(" ")}
          >
            {subtitle}
          </p>
        </div>

        <FaChevronRight className="justify-self-end text-zinc-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
      </div>
    </Link>
  );
}

export default function AdminHome() {
  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-3.5 sm:px-6 md:px-8 py-6 md:py-10 min-w-0">
      <header className="mb-5 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 dark:border-emerald-300/15 bg-white/70 dark:bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <FaShieldHalved aria-hidden />
              Backschmiede · Admin-Bereich
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Verwaltung
            </h1>

            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              Produkte und Inhalte pflegen - schnell und übersichtlich.
            </p>
          </div>

          <form action={logout} className="sm:self-start">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-800/10 dark:border-emerald-300/15 bg-white/80 dark:bg-white/10 px-3 py-2 text-sm shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
              title="Abmelden"
            >
              <FaRightFromBracket className="opacity-80" />
              Abmelden
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-3.5 sm:gap-4 md:gap-4 sm:grid-cols-2">
        <AdminTile
          href="/admin/products"
          title="Produkte"
          subtitle="Artikel, Preise, Einheiten & Bilder verwalten"
          Icon={FaListUl}
          accent="emerald"
        />
        <AdminTile
          href="/admin/offers"
          title="Angebote"
          subtitle="Tages-/Wochen-Deals, Zeiträume & Filialen steuern"
          Icon={FaTag}
          accent="amber"
        />
        <AdminTile
          href="/admin/events"
          title="Veranstaltungen"
          subtitle="Termine, Aktionen & Timeline pflegen"
          Icon={FaCalendarDays}
          accent="cyan"
        />
        <AdminTile
          href="/admin/news"
          title="News"
          subtitle="Aktuelles erstellen & verwalten"
          Icon={FaNewspaper}
          accent="sky"
        />
        <AdminTile
          href="/admin/about"
          title="Über uns"
          subtitle="Inhaber, Team & Bereiche der Über-uns-Seite"
          Icon={FaPeopleGroup}
          accent="rose"
        />
        <AdminTile
          href="/admin/jobs"
          title="Jobs"
          subtitle="Stellenanzeigen für Google Jobs & Website"
          Icon={FaBriefcase}
          accent="lime"
        />
        <AdminTile
          href="/admin/analytics"
          title="Analytics"
          subtitle="Besucher, Seiten, Quellen & Geräte"
          Icon={FaChartLine}
          accent="violet"
        />
      </section>

      <section className="mt-6">
        <div className="rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-4 md:p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Hinweise</h2>
          <ul className="mt-2 list-disc pl-5 text-sm opacity-80 space-y-1">
            <li>
              Bei Angeboten steuert die <span className="font-medium">Priorität</span> die
              Reihenfolge (höher = weiter oben).
            </li>
            <li>
              Zeiträume sind inklusiv - Start und Ende zählen mit (Berlin-Zeit).
            </li>
          </ul>

          <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
            Version: <span className="font-mono">{WEBSITE_VERSION}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
