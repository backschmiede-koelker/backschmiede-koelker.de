// /app/lib/ics.ts
type VEvent = {
  uid: string;
  title: string;
  start: string; // ISO
  end?: string;  // ISO
  description?: string;
  location?: string;
};

function formatDate(dt: string) {
  const d = new Date(dt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const YYYY = d.getUTCFullYear();
  const MM = pad(d.getUTCMonth() + 1);
  const DD = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${YYYY}${MM}${DD}T${hh}${mm}${ss}Z`;
}

export function buildIcsFile(events: VEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Backschmiede//Events//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const e of events) {
    const dtStart = formatDate(e.start);
    const dtEnd = formatDate(e.end ?? e.start);
    const esc = (s?: string) =>
      (s ?? "").replace(/\\/g, "\\\\").replace(/[\n\r]/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `SUMMARY:${esc(e.title)}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      e.location ? `LOCATION:${esc(e.location)}` : "",
      e.description ? `DESCRIPTION:${esc(e.description)}` : "",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}
