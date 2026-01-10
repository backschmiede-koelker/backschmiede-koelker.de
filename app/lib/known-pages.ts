// /app/lib/known-pages.ts
export type KnownPage = { label: string; href: string };

export const KNOWN_PAGES: KnownPage[] = [
  { label: "Startseite", href: "/" },
  { label: "Angebote", href: "/#angebote" },
  { label: "Öffnungszeiten", href: "/#oeffnungszeiten" },
  { label: "Produkte", href: "/products" },
  { label: "Events", href: "/events" },
  { label: "Jobs", href: "/jobs" },
  { label: "Über uns", href: "/about" },
  { label: "Impressum", href: "/imprint" },
  { label: "Datenschutz", href: "/privacy" },
];
