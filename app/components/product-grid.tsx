'use client'
import { useEffect, useMemo, useState } from 'react'

type Product = {
  id: string
  name: string
  slug: string
  priceCents: number
  unit: string
  imageUrl?: string | null
  tags: string[]
  updatedAt: string
}

export default function ProductGrid() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState<string>('Alle')
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => { (async () => {
    const res = await fetch("/api/products?active=true", { cache: "no-store" })
    setItems(await res.json())
  })() }, [])

  const tags = useMemo(() => {
    const t = new Set<string>()
    items.forEach(p => p.tags?.forEach(x => t.add(x)))
    return ['Alle', ...Array.from(t)]
  }, [items])

  const filtered = items.filter(p =>
    (tag === 'Alle' || p.tags.includes(tag)) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) ||
     p.tags.some(t => t.toLowerCase().includes(q.toLowerCase())))
  )

  const euro = (n: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Suche…" className="px-3 py-2 rounded border bg-white dark:bg-zinc-800" />
        <select value={tag} onChange={e=>setTag(e.target.value)} className="px-3 py-2 rounded border bg-white dark:bg-zinc-800">
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow">
            {p.imageUrl &&
              <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover" />}
            <div className="p-4">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm opacity-70">{p.tags.join(' · ')}</p>
              <p className="mt-2 font-medium">
                {euro(p.priceCents/100)}{p.unit && <span className="text-sm opacity-70"> / {p.unit}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
