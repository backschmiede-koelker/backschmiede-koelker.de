// /app/components/jobs/sections/breadcrumbs.tsx
import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <nav className="text-sm opacity-80" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {it.href ? (
              <Link className="hover:underline" href={it.href}>
                {it.name}
              </Link>
            ) : (
              <span className="font-medium">{it.name}</span>
            )}
            {i < items.length - 1 && <span>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
