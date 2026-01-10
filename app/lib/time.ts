// /app/lib/time.ts
export function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function fmtDate(date: Date | string, opts: Intl.DateTimeFormatOptions = {}) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', ...opts }).format(d);
}

export function startOfISOWeek(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0,0,0,0);
  return d;
}

export function endOfISOWeek(date = new Date()) {
  const s = startOfISOWeek(date);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23,59,59,999);
  return e;
}