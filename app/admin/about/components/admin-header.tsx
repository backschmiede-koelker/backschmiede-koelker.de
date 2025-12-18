// app/admin/about/components/admin-header.tsx
export default function AdminHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header>
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/10 dark:border-emerald-300/15 bg-white/70 dark:bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
        Admin · About
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{subtitle}</p>
      )}
    </header>
  );
}
