// app/lib/seasonal.ts
export function isWinterSeason(date = new Date()) {
  const m = date.getMonth(); // 0=Jan ... 11=Dez
  return m === 11 || m === 0 || m === 1; // Dez, Jan, Feb
}
