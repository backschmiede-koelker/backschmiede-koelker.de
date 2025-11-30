// /app/products/page.tsx
import type { Metadata } from "next";
import ProductGrid from "../components/product-grid"

export const metadata: Metadata = {
  title: "Produkte | Backschmiede Kölker",
  description:
    "Brot, Brötchen, Kuchen und Gebäck aus der Backschmiede Kölker mit langer Teigführung und saisonalen Zutaten.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Produkte | Backschmiede Kölker",
    description:
      "Brot, Brötchen, Kuchen und Gebäck aus der Backschmiede Kölker mit langer Teigführung und saisonalen Zutaten.",
    url: "/products",
    type: "website",
  },
};

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Produkte</h1>
      <ProductGrid />
    </div>
  )
}
