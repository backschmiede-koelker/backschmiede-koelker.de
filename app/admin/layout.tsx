import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

// /app/admin/layout.tsx
export const metadata: Metadata = {
  title: "Admin | Backschmiede Kölker - Handwerk aus Recke & Mettingen",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <section className="relative min-h-dvh min-w-0 overflow-x-hidden">
      {children}
    </section>
  );
}
