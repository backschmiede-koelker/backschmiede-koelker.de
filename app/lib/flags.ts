// app/lib/flags.ts

export const BUILDING = process.env.NEXT_PUBLIC_BUILDING === "true";

// Admin-only migration button for one-time product image conversion.
// Set NEXT_PUBLIC_SHOW_PRODUCT_IMAGE_MIGRATION_BUTTON to "0" or "false" to hide.
const migrationFlag = process.env.NEXT_PUBLIC_SHOW_PRODUCT_IMAGE_MIGRATION_BUTTON;
export const SHOW_PRODUCT_IMAGE_MIGRATION_BUTTON =
  migrationFlag == null
    ? true
    : migrationFlag !== "0" && migrationFlag.toLowerCase() !== "false";
