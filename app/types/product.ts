// /app/types/product.ts
import type { Allergen } from "@/generated/prisma/client";

export type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  unit: string;
  imageUrl?: string | null;
  tags: string[];
  allergens: Allergen[];
  isActive: boolean;
  updatedAt: string;
};
