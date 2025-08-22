'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FaInstagram,
  FaLocationDot,
  FaHouse,
  FaListUl,
  FaCalendarDays,
  FaUser,
  FaBriefcase,
} from 'react-icons/fa6';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type NavItem = {
  href: string;
  label: string;
  sub: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { href: '/',          label: 'Start',         sub: 'Willkommen',                 Icon: FaHouse },
  { href: '/products',  label: 'Produkte',      sub: 'Brote · Brötchen · Kuchen', Icon: FaListUl },
  { href: '/events',    label: 'Veranstaltungen', sub: 'Kurse & Aktionen',        Icon: FaCalendarDays },
  { href: '/owner',     label: 'Inhaber',       sub: 'Lerne Josua kennen',        Icon: FaUser },
  { href: '/jobs',      label: 'Jobs',          sub: 'Werde Teil des Teams',      Icon: FaBriefcase },
];

function GlowTile({
  href,
  children,
  active = false,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  external?: boolean;
}) {
  const Comp: any = external ? 'a' : Link;
  const props = external
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { href };

  return (
    <Comp
      {...props}
      aria-current={active ? 'page' : undefined}
      className={`group relative block rounded-2xl px-4 py-3 xl:py-3.5 2xl:px-5 2xl:py-4
        border border-emerald-800/10 dark:border-emerald-300/10
        bg-white/70 dark:bg-white/5
        shadow-sm hover:shadow-md
        transition-all duration-300
        outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
        ${active ? 'ring-2 ring-emerald-500/50' : ''}`}
    >
      {/* Light Shine */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0
        group-hover:opacity-100 transition-opacity duration-300
        bg-gradient-to-r from-amber-200/30 via-emerald-200/30 to-amber-200/30
        dark:opacity-0"
      />
      {/* Dark Shine */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0
        dark:group-hover:opacity-100 transition-opacity duration-300
        dark:bg-gradient-to-r dark:from-emerald-700/25 dark:via-teal-600/20 dark:to-emerald-700/25
        dark:ring-1 dark:ring-emerald-300/30 dark:group-hover:ring-emerald-300/60"
      />
      <div className="relative z-10">{children}</div>
    </Comp>
  );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop (nur mobil) */}
      {open && (
        <button
          aria-label="Menü schließen"
          onClick={onClose}
          className="fixed inset-0 bg-black/40 md:hidden z-40"
        />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
        className={`isolate fixed top-0 left-0 w-72 h-dvh
        bg-gradient-to-b from-emerald-50 to-emerald-100
        dark:from-green-950 dark:to-green-900
        text-black dark:text-white z-50 p-6
        transform transition-transform duration-300
        overflow-y-auto overscroll-contain [scrollbar-gutter:stable] no-scrollbar
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* --- NEU: Flex-Column, damit unten sauber andockt --- */}
        <div className="flex h-full flex-col">
          {/* Close nur mobil */}
          <div className="md:hidden flex justify-end mb-2">
            <button
              onClick={onClose}
              className="text-black dark:text-white text-2xl font-bold px-3 py-1 rounded transition-transform duration-300 hover:rotate-90 active:scale-90 focus:outline-none"
              aria-label="Seitenleiste schließen"
            >
              ✕
            </button>
          </div>

          {/* Logo */}
          <div className="mb-6 2xl:mb-8 mx-auto w-[180px] 2xl:w-[200px]">
            <Image
              src="/Logo1-transparent-komplett-schwarz.png"
              alt="Backschmiede Kölker Logo (hell)"
              width={180}
              height={180}
              className="rounded-xl block dark:hidden"
            />
            <Image
              src="/Logo1-transparent-komplett-weiß.png"
              alt="Backschmiede Kölker Logo (dunkel)"
              width={180}
              height={180}
              className="rounded-xl hidden dark:block"
            />
          </div>

          <h2 id="sidebar-title" className="sr-only">Navigation</h2>

          {/* Hauptnavigation */}
          <nav className="space-y-2 mb-6 xl:space-y-3 2xl:space-y-4">
            {NAV.map(({ href, label, sub, Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <GlowTile key={href} href={href} active={active}>
                  <div className="flex items-center gap-3">
                    <Icon className="text-xl xl:text-[22px] 2xl:text-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    <div>
                      <div className="text-base font-semibold leading-tight">{label}</div>
                      <div className="text-xs opacity-70">{sub}</div>
                    </div>
                    <span
                      className="ml-auto translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-lg"
                      aria-hidden
                    >
                      ›
                    </span>
                  </div>
                </GlowTile>
              );
            })}
          </nav>

          {/* ---- Spacer füllt die Mitte; bleibt unsichtbar klein, nimmt nur Resthöhe ein ---- */}
          <div className="flex-1" />

          {/* Standorte & Social – unten andocken, durch Border optisch abgeschlossen */}
          <div className="mt-auto space-y-3 pb-4 pt-5 xl:space-y-4 2xl:space-y-5 2xl:pt-6 2xl:pb-6 border-t border-emerald-800/10 dark:border-emerald-300/10">
            <p className="text-xs uppercase tracking-wider opacity-60">Standorte & Social</p>

            <GlowTile href="https://www.instagram.com/backschmiede_koelker" external>
              <div className="grid grid-cols-[auto,1fr] gap-3 xl:gap-4 2xl:gap-5 items-center">
                <FaInstagram className="text-lg shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-sm">@Backschmiede Kölker</div>
                  <div className="text-xs opacity-70">Mettingen</div>
                </div>
              </div>
            </GlowTile>

            <GlowTile href="https://maps.app.goo.gl/gyHqK9nJXGHv4oxX6" external>
              <div className="flex items-center gap-3">
                <FaLocationDot className="text-lg shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate min-w-0 flex-1">Mettingen</span>
              </div>
            </GlowTile>

            <GlowTile href="https://www.instagram.com/recke.backschmiede_koelker" external>
              <div className="grid grid-cols-[auto,1fr] gap-3 xl:gap-4 2xl:gap-5 items-center">
                <FaInstagram className="text-lg shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-sm">@Backschmiede Kölker</div>
                  <div className="text-xs opacity-70">Recke</div>
                </div>
              </div>
            </GlowTile>

            <GlowTile href="https://maps.app.goo.gl/v7fAobfiUPDe8xTV6" external>
              <div className="flex items-center gap-3">
                <FaLocationDot className="text-lg shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate min-w-0 flex-1">Recke</span>
              </div>
            </GlowTile>
          </div>
        </div>
      </aside>
    </>
  );
}
