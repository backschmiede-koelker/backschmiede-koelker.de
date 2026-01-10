// app/admin/jobs/components/presets.ts
import type { JobCategory, JobEmploymentType } from "@/app/lib/jobs/types";

export type JobPreset = {
  key: string;
  label: string;
  category: JobCategory;

  title: string;
  teaser: string;
  description: string;

  employmentTypes: JobEmploymentType[];

  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
};

export const JOB_PRESETS: JobPreset[] = [
  {
    key: "baecker",
    label: "Bäcker/in",
    category: "BAECKER",
    title: "Bäcker/in (m/w/d)",
    teaser:
      "Du liebst Handwerk und Qualität? Werde Teil unserer Backstube - mit festen Abläufen und einem guten Team.",
    description:
      "Wir backen mit Leidenschaft und Anspruch.\n\nBei uns arbeitest du in einem eingespielten Team - mit klaren Abläufen, guter Einarbeitung und fairen Bedingungen.\n\nWenn du Fragen hast, melde dich gern kurz.",
    employmentTypes: ["FULL_TIME", "PART_TIME"],
    responsibilities: [
      "Herstellung von Backwaren nach Rezepturen",
      "Teigführung, Ofenarbeit & Vorbereitung",
      "Qualitätskontrolle & Hygiene nach HACCP",
    ],
    qualifications: [
      "Sorgfältige Arbeitsweise & Teamgeist",
      "Erfahrung in der Backstube (nice to have)",
      "Bereitschaft zu frühen Arbeitszeiten",
    ],
    benefits: ["Feste Teams & planbare Abläufe", "Mitarbeiterrabatte", "Faire Bezahlung & Zuschläge"],
  },

  // ✅ NEU: Konditor/in
  {
    key: "konditor",
    label: "Konditor/in",
    category: "KONDITOR",
    title: "Konditor/in (m/w/d)",
    teaser:
      "Du liebst feines Handwerk? Werde Teil unseres Teams - von Cremes über Torten bis Dekoration, mit Struktur und Ruhe im Ablauf.",
    description:
      "Bei uns zählt Qualität und sauberes Arbeiten.\n\nDu arbeitest im Team mit klaren Abläufen, guter Einarbeitung und fairen Bedingungen.\n\nWenn du Fragen hast, melde dich gern kurz.",
    employmentTypes: ["FULL_TIME", "PART_TIME"],
    responsibilities: [
      "Herstellung von Feinbackwaren, Torten & Gebäck",
      "Cremes, Füllungen & Massen herstellen",
      "Dekoration / Garnieren nach Standards",
      "Qualitätskontrolle & Hygiene nach HACCP",
    ],
    qualifications: [
      "Sorgfältige Arbeitsweise & Qualitätsbewusstsein",
      "Erfahrung als Konditor/in (nice to have)",
      "Handwerkliches Geschick & Teamgeist",
    ],
    benefits: ["Feste Abläufe", "Gründliche Einarbeitung", "Mitarbeiterrabatte"],
  },

  // ✅ NEU: Kombi-Preset
  {
    key: "baecker_konditor",
    label: "Bäcker/in & Konditor/in",
    category: "PRODUKTION",
    title: "Bäcker/in & Konditor/in (m/w/d)",
    teaser:
      "Du kannst beides - oder willst dich entwickeln? Backstube & Konditorei: klare Abläufe, gutes Team, fair und planbar.",
    description:
      "Bei uns zählt Handwerk und Qualität.\n\nDu unterstützt je nach Stärke in Backstube oder Konditorei - mit guter Einarbeitung und klaren Abläufen.\n\nWenn du Fragen hast, melde dich gern kurz.",
    employmentTypes: ["FULL_TIME", "PART_TIME"],
    responsibilities: [
      "Herstellung von Backwaren & Feinbackwaren nach Standards",
      "Vorbereitung, Ofenarbeit & Dekoration (je nach Schwerpunkt)",
      "Qualitätskontrolle & Hygiene nach HACCP",
    ],
    qualifications: [
      "Sorgfältige Arbeitsweise & Teamgeist",
      "Erfahrung wünschenswert (nicht zwingend)",
      "Qualitätsbewusstsein",
    ],
    benefits: ["Feste Teams", "Planbare Abläufe", "Faire Bezahlung"],
  },

  {
    key: "verkaeufer",
    label: "Verkäufer/in",
    category: "VERKAEUFER",
    title: "Verkäufer/in (m/w/d)",
    teaser:
      "Du hast Freude am Umgang mit Menschen? Wir suchen Unterstützung im Verkauf - freundlich, zuverlässig, teamorientiert.",
    description:
      "Im Verkauf bist du unsere Visitenkarte.\n\nDu berätst Kunden, präsentierst Ware ansprechend und sorgst dafür, dass alles rund läuft.\n\nErzähl uns kurz, welche Zeiten für dich passen.",
    employmentTypes: ["PART_TIME", "MINI_JOB", "FULL_TIME"],
    responsibilities: [
      "Freundliche Kundenberatung & Verkauf",
      "Warenpräsentation & Auffüllen",
      "Kasse & Tagesabläufe im Blick behalten",
    ],
    qualifications: [
      "Offene, freundliche Art",
      "Zuverlässigkeit & Sorgfalt",
      "Erfahrung im Verkauf (nice to have)",
    ],
    benefits: ["Planbare Schichten", "Gründliche Einarbeitung", "Mitarbeiterrabatte"],
  },

  {
    key: "azubi",
    label: "Azubi",
    category: "AZUBI",
    title: "Ausbildung (m/w/d)",
    teaser:
      "Du willst ein echtes Handwerk lernen? Starte deine Ausbildung bei uns - in Backstube oder Verkauf.",
    description:
      "Wir bilden aus - mit Geduld, Struktur und einem Team, das dich mitnimmt.\n\nSag uns kurz, für welchen Bereich du dich interessierst (Backstube/Verkauf) und ab wann du starten möchtest.",
    employmentTypes: ["APPRENTICESHIP"],
    responsibilities: [
      "Mitarbeit im Tagesgeschäft (je nach Bereich)",
      "Lernen von Abläufen, Rezepturen & Standards",
      "Teamarbeit & Mitdenken",
    ],
    qualifications: ["Motivation & Lernbereitschaft", "Zuverlässigkeit & Pünktlichkeit", "Freundlicher Umgang im Team"],
    benefits: ["Gute Betreuung", "Klare Lernstruktur", "Übernahmechancen"],
  },

  {
    key: "aushilfe",
    label: "Aushilfe",
    category: "AUSHILFE",
    title: "Aushilfe (m/w/d)",
    teaser:
      "Du willst nebenbei etwas dazuverdienen? Wir suchen Aushilfen - flexibel, zuverlässig und im Team zuhause.",
    description:
      "Als Aushilfe unterstützt du uns dort, wo gerade Hilfe gebraucht wird - z.B. im Verkauf, bei Vorbereitung oder im Tagesablauf.\n\nSag uns kurz, wann du Zeit hast.",
    employmentTypes: ["MINI_JOB", "PART_TIME"],
    responsibilities: [
      "Unterstützung im Tagesablauf (je nach Bereich)",
      "Vorbereitung & einfache Tätigkeiten",
      "Ordnung, Sauberkeit & Teamunterstützung",
    ],
    qualifications: ["Zuverlässigkeit", "Teamfähigkeit", "Sorgfältige Arbeitsweise"],
    benefits: ["Flexible Einsatzplanung", "Gutes Team", "Mitarbeiterrabatte"],
  },

  {
    key: "logistik",
    label: "Logistik",
    category: "LOGISTIK",
    title: "Logistik / Auslieferung (m/w/d)",
    teaser:
      "Du packst gern an und behältst den Überblick? Unterstütze uns in Logistik/Auslieferung - zuverlässig & organisiert.",
    description:
      "In der Logistik sorgst du dafür, dass alles zur richtigen Zeit am richtigen Ort ist.\n\nSchreib uns kurz, welche Zeiten für dich passen und ob du einen Führerschein hast (falls relevant).",
    employmentTypes: ["PART_TIME", "MINI_JOB", "FULL_TIME"],
    responsibilities: [
      "Waren bereitstellen & sortieren",
      "Lieferungen vorbereiten / ggf. ausliefern",
      "Ordnung & Kontrolle im Ablauf",
    ],
    qualifications: ["Zuverlässigkeit & Pünktlichkeit", "Sorgfalt", "Führerschein (wenn nötig)"],
    benefits: ["Planbare Zeiten", "Gutes Team", "Faire Bezahlung"],
  },

  {
    key: "produktion",
    label: "Produktion",
    category: "PRODUKTION",
    title: "Produktion (m/w/d)",
    teaser:
      "Du arbeitest gern strukturiert? Unterstütze uns in der Produktion - mit klaren Abläufen und einem festen Team.",
    description:
      "In der Produktion unterstützt du bei vorbereitenden Tätigkeiten und Abläufen rund um unsere Backwaren.\n\nSchreib uns kurz, welche Zeiten für dich passen.",
    employmentTypes: ["FULL_TIME", "PART_TIME"],
    responsibilities: [
      "Vorbereitung / Mise en place",
      "Unterstützung bei Produktionsabläufen",
      "Hygiene & Standards einhalten",
    ],
    qualifications: ["Sorgfältige Arbeitsweise", "Teamfähigkeit", "Belastbarkeit"],
    benefits: ["Feste Abläufe", "Gründliche Einarbeitung", "Mitarbeiterrabatte"],
  },

  {
    key: "verwaltung",
    label: "Verwaltung",
    category: "VERWALTUNG",
    title: "Verwaltung (m/w/d)",
    teaser:
      "Du arbeitest gern organisiert und zuverlässig? Unterstütze uns in der Verwaltung - strukturiert und im Team.",
    description:
      "In der Verwaltung unterstützt du bei organisatorischen Themen - je nach Bedarf.\n\nSchreib uns kurz, welche Aufgaben dir liegen und wann du starten könntest.",
    employmentTypes: ["PART_TIME", "FULL_TIME"],
    responsibilities: [
      "Organisation & Unterstützung im Tagesgeschäft",
      "Kommunikation & Ablage",
      "Zuarbeit nach Bedarf",
    ],
    qualifications: ["Strukturierte Arbeitsweise", "Zuverlässigkeit", "Kommunikationsfähigkeit"],
    benefits: ["Planbare Zeiten", "Gutes Team", "Faire Bedingungen"],
  },

  {
    key: "sonstiges",
    label: "Sonstiges",
    category: "SONSTIGES",
    title: "Mitarbeiter/in (m/w/d)",
    teaser:
      "Du findest dich nicht in den Kategorien wieder? Bewirb dich trotzdem - wir prüfen gemeinsam, was passt.",
    description:
      "Manchmal passt ein Profil nicht in eine Schublade.\n\nSchreib uns kurz, worauf du Lust hast und welche Zeiten für dich passen - wir melden uns.",
    employmentTypes: ["FULL_TIME", "PART_TIME", "MINI_JOB"],
    responsibilities: ["Unterstützung je nach Bereich", "Teamarbeit", "Zuverlässiger Einsatz im Alltag"],
    qualifications: ["Motivation", "Teamfähigkeit", "Zuverlässigkeit"],
    benefits: ["Gutes Team", "Faire Bezahlung", "Mitarbeiterrabatte"],
  },
];
