"use client"
import { useEffect, useState } from "react"

type Product = {
  id: string; name: string; slug: string; priceCents: number; unit: string;
  imageUrl?: string | null; tags: string[]; isActive: boolean
}

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([])
  const [form, setForm] = useState({ name:"", slug:"", priceCents:0, unit:"pro Stück", imageUrl:"", tags:"" })

  async function load() {
    const res = await fetch("/api/products", { cache: "no-store" })
    setItems(await res.json())
  }
  useEffect(()=>{ load() }, [])

  async function create() {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        ...form,
        priceCents: Number(form.priceCents),
        tags: form.tags.split(",").map(s=>s.trim()).filter(Boolean)
      })
    })
    setForm({ name:"", slug:"", priceCents:0, unit:"pro Stück", imageUrl:"", tags:"" })
    load()
  }

  async function remove(id: string) {
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Produkte</h1>

      <div className="grid gap-2 md:grid-cols-6">
        <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Slug" value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})}/>
        <input className="border p-2 rounded" type="number" placeholder="Preis (Cent)" value={form.priceCents} onChange={e=>setForm({...form, priceCents:Number(e.target.value)})}/>
        <input className="border p-2 rounded" placeholder="Einheit" value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Bild-URL (vom CDN)" value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Tags (kommagetrennt)" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})}/>
        <button className="md:col-span-6 rounded bg-black text-white py-2" onClick={create}>Anlegen</button>
      </div>

      <ul className="space-y-2">
        {items.map(p=>(
          <li key={p.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.slug} · {(p.priceCents/100).toFixed(2)} € · {p.unit}</div>
              {p.tags?.length ? <div className="text-xs text-gray-500">Tags: {p.tags.join(", ")}</div> : null}
            </div>
            <button className="text-red-600" onClick={()=>remove(p.id)}>Löschen</button>
          </li>
        ))}
      </ul>
    </main>
  )
}
