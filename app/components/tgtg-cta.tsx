'use client'
export default function TgtgCta() {
  return (
    <div className="rounded-2xl p-5 bg-emerald-500/10 border border-emerald-500/20">
      <h3 className="text-xl font-bold mb-1">Too Good To Go</h3>
      <p className="text-sm opacity-80 mb-3">Rette Überraschungstüten und spare – direkt in der App.</p>
      <div className="flex gap-2">
        <a href="https://www.toogoodtogo.com/" target="_blank" className="px-4 py-2 rounded bg-emerald-600 text-white">Zur App</a>
        <a href="https://store.toogoodtogo.com/" target="_blank" className="px-4 py-2 rounded bg-white dark:bg-zinc-800 border">Für Partner</a>
      </div>
    </div>
  );
}