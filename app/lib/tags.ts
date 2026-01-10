// /app/lib/tags.ts
export function toTitleCaseWord(w: string) {
  const lower = w.trim().toLowerCase()
  return lower.replace(/^\p{L}/u, (m) => (m as string).toUpperCase())
}

export function parseTags(s: string) {
  return Array.from(new Set(
    s.split(",").map(x => x.trim()).filter(Boolean).map(toTitleCaseWord)
  ))
}
