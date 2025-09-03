export const metadata = { title: "Admin | Backschmiede" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section
      className={[
        "min-h-dvh isolate",
      ].join(" ")}
    >
      {/* weiche Blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-amber-300/25 blur-[110px] dark:bg-amber-400/15" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-emerald-300/25 blur-[120px] dark:bg-teal-700/15" />

      {/* Inhalt */}
      <div className="relative">
        {children}
      </div>
    </section>
  );
}
