export const ALLERGENS = [
  "GLUTEN",
  "CRUSTACEANS",
  "EGGS",
  "FISH",
  "PEANUTS",
  "SOY",
  "MILK",
  "NUTS",
  "CELERY",
  "MUSTARD",
  "SESAME",
  "SULPHITES",
  "LUPIN",
  "MOLLUSCS",
] as const;

export type Allergen = (typeof ALLERGENS)[number];

export const ALLERGEN_LABEL: Record<Allergen, string> = {
  GLUTEN: "Gluten",
  CRUSTACEANS: "Krebstiere",
  EGGS: "Ei",
  FISH: "Fisch",
  PEANUTS: "Erdnüsse",
  SOY: "Soja",
  MILK: "Milch (Laktose)",
  NUTS: "Schalenfrüchte",
  CELERY: "Sellerie",
  MUSTARD: "Senf",
  SESAME: "Sesam",
  SULPHITES: "Schwefeldioxid/Sulfite",
  LUPIN: "Lupine",
  MOLLUSCS: "Weichtiere",
};
