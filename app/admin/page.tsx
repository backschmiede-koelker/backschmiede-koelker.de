// /app/admin/page.tsx
import Link from "next/link";
import { FaListUl, FaTag, FaChevronRight, FaShieldHalved, FaRightFromBracket, FaChartLine } from "react-icons/fa6";
import { signOut } from "@/auth";

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
  accent?: "emerald" | "amber";
}) {
  const ring =
    accent === "amber"
      ? "ring-amber-500/20 hover:ring-amber-500/30"
      : "ring-emerald-600/20 hover:ring-emerald-600/30";
  const badge =
    accent === "amber"
      ? "bg-amber-600/15 text-amber-700 dark:text-amber-300 ring-amber-600/20"
      : "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20";

  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden rounded-2xl",
        "bg-white/80 dark:bg-white/5 backdrop-blur",
        "shadow-sm hover:shadow-md transition-all active:scale-[0.98]",
        "ring-1", ring,
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
        "p-4 md:p-5",
      ].join(" ")}
    >
      {/* Shine */}
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/0 via-white/20 to-white/0 dark:from-white/0 dark:via-white/10 dark:to-white/0" />

      <div className="flex items-start gap-4">
        <div className={[
          "grid h-12 w-12 place-items-center rounded-xl",
          "border border-black/5 dark:border-white/10",
          accent === "amber" ? "bg-amber-500/10" : "bg-emerald-500/10",
        ].join(" ")}>
          <Icon className="text-xl opacity-90" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold leading-tight">{title}</h3>
            <span className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
              badge,
            ].join(" ")}>
              Admin
            </span>
          </div>
          <p className="mt-1 text-sm opacity-75">{subtitle}</p>
        </div>

        <FaChevronRight className="mt-1 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-0.5" />
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
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <header className="mb-6 md:mb-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 dark:border-emerald-300/15 bg-white/70 dark:bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <FaShieldHalved aria-hidden />
              Backschmiede · Admin-Bereich
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Verwaltung</h1>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              Produkte und Angebote pflegen - schnell und übersichtlich.
            </p>
          </div>

          {/* Logout als Server Action */}
          <form action={logout}>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/10 dark:border-emerald-300/15 bg-white/80 dark:bg-white/10 px-3 py-2 text-sm shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
              title="Abmelden"
            >
              <FaRightFromBracket className="opacity-80" />
              Abmelden
            </button>
          </form>
        </div>
      </header>

      {/* Kachel-Grid */}
      <section className="grid gap-4 sm:grid-cols-2">
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
          href="/admin/analytics"
          title="Analytics"
          subtitle="Besucher, Seiten, Quellen & Geräte"
          Icon={FaChartLine}
          accent="emerald"
        />
      </section>

      {/* Info-Card */}
      <section className="mt-6">
        <div className="rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-4 md:p-5 shadow-sm">
          <h2 className="text-sm font-semibold">Hinweise</h2>
          <ul className="mt-2 list-disc pl-5 text-sm opacity-80 space-y-1">
            <li>Bei Angeboten steuert die <span className="font-medium">Priorität</span> die Reihenfolge (höher = weiter oben).</li>
            <li>Zeiträume sind inklusiv - Start und Ende zählen mit (Berlin-Zeit).</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
