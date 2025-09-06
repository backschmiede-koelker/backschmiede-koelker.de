// /app/products/page.tsx
import ProductGrid from "../components/product-grid"

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Produkte</h1>
      <ProductGrid />
    </div>
  )
}
