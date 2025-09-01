export const metadata = { title: "Admin | Backschmiede" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <section className="min-h-dvh">{children}</section>;
}
