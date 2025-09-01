// maybe create ics file

/*
import { NextResponse } from 'next/server';
import { events } from '../../data/events';

export async function GET() {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Backschmiede Koelker//DE',
  ];
  for (const e of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.id}@backschmiede-koelker.de`);
    lines.push(`DTSTAMP:${toICS(new Date())}`);
    lines.push(`DTSTART:${toICS(new Date(e.start))}`);
    if (e.end) lines.push(`DTEND:${toICS(new Date(e.end))}`);
    lines.push(`SUMMARY:${escapeText(e.title)}`);
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  const body = lines.join('\r\n');
  return new NextResponse(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}

function toICS(d: Date) {
  // ICS in UTC
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) + 'Z'
  );
}

function escapeText(s: string) {
  return s.replace(/[\\;,\n]/g, (m) => ({'\\':'\\\\',';':'\\;',',':'\\,','\n':'\\n'} as any)[m]);
}
*/