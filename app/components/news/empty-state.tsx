// app/components/news/empty-state.tsx
export function EmptyState() {
  return (
    <div className="h-[520px] sm:h-[560px] w-full rounded-2xl ring-1 ring-black/5 bg-white/90 p-4 text-sm text-zinc-600 shadow-sm dark:bg-zinc-900/60 dark:ring-white/10 dark:text-zinc-300 flex items-center justify-center text-center">
      Momentan keine Neuigkeiten.
    </div>
  );
}
