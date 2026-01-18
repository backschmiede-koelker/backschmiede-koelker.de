// app/api/about/_auth.ts
import { requireAdmin } from "@/lib/auth-guards";

export async function requireAdminOr401() {
  return requireAdmin();
}
