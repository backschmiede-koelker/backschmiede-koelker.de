// /app/types/product.ts
export type Product = {
  id: string
  name: string
  slug: string
  priceCents: number
  unit: string
  imageUrl?: string | null
  tags: string[]
  isActive: boolean
  updatedAt: string
}
