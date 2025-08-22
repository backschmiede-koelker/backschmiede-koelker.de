'use client';
import { useMemo, useState } from 'react';
import { products } from '../data/products';

export default function ProductGrid() {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string>('Alle');

  const tags = useMemo(() => {
    const t = new Set<string>();
    products.forEach(p => p.tags.forEach(t.add, t));
    return ['Alle', ...Array.from(t)];
  }, []);

  const filtered = products.filter(p =>
    (tag === 'Alle' || p.tags.includes(tag)) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) || p.tags.some(t => t.includes(q.toLowerCase())))
  );

  const euro = (n: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Suche…" className="px-3 py-2 rounded border bg-white dark:bg-zinc-800" />
        <select value={tag} onChange={e=>setTag(e.target.value)} className="px-3 py-2 rounded border bg-white dark:bg-zinc-800">
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow">
            {p.image && <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />}
            <div className="p-4">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm opacity-70">{p.tags.join(' · ')}</p>
              <p className="mt-2 font-medium">{euro(p.price)}{p.unit && <span className="text-sm opacity-70"> / {p.unit}</span>}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}