// /app/hooks/use-products.tsx
"use client"
import { useEffect, useState } from "react"
import { Product } from "../types/product"

export function useProducts() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { reload() }, [])

  async function reload() {
    setLoading(true)
    try {
      const res = await fetch("/api/products", { cache: "no-store" })
      const data: Product[] = await res.json()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Wirklich löschen?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    await reload()
  }

  return { items, loading, reload, remove }
}