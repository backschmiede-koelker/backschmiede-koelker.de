// app/admin/offers/page.tsx
'use client';

import { useState } from 'react';
import type { OfferUpsert, LocationKey } from '../../lib/offers';

const defaultOffer: OfferUpsert = {
  title: '',
  price: undefined,
  unit: '',
  badge: '',
  description: '',
  image: '',
  tags: [],
  locations: ['BOTH'] as LocationKey[],
  startDate: '',
  endDate: '',
};

const LOCS: LocationKey[] = ['BOTH', 'RECKE', 'METTINGEN'];

export default function AdminOffersPage() {
  const [form, setForm] = useState<OfferUpsert>(defaultOffer);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof OfferUpsert>(key: K, val: OfferUpsert[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submit() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Fehler beim Speichern');
      setMsg('Gespeichert ✔');
      setForm(defaultOffer);
    } catch (e: any) {
      setMsg(e.message || 'Unbekannter Fehler');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Angebot erfassen</h1>
      <p className="text-sm opacity-70">Wird nach Zeitraum automatisch auf der Startseite angezeigt.</p>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Titel</label>
          <input className="rounded-md border px-3 py-2 bg-white dark:bg-zinc-900" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Preis (EUR)</label>
            <input type="number" step="0.01" className="rounded-md border px-3 py-2 bg-white dark:bg-zinc-900"
              value={form.price ?? ''} onChange={e => set('price', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Einheit</label>
            <input className="rounded-md border px-3 py-2 bg-white dark:bg-zinc-900" value={form.unit ?? ''} onChange={e => set('unit', e.target.value)} />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Badge (optional)</label>
          <input className="rounded-md border px-3 py-2 bg-white dark:bg-zinc-900" value={form.badge ?? ''} onChange={e => set('badge', e.target.value)} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Beschreibung (optional)</label>
          <textarea rows={3} className="rounded-md border px-3 py-2 bg-white dark:bg-zinc-900" value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Bild (Pfad, optional)</label>
          <input placeholder="/products/brot.jpg" className="rounded-md border px-3 py-2 bg-white dark:bg-zinc-900" value={form.image ?? ''} onChange={e => set('image', e.target.value)} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Tags (Komma getrennt, werden GROSS geschrieben)</label>
          <input className="rounded-md border px-3 py-2 bg-white dark:bg-zinc-900" value={(form.tags ?? []).join(', ')}
            onChange={e => set('tags', e.target.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean))} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Standorte</label>
          <div className="flex flex-wrap gap-2">
            {LOCS.map(loc => {
              const active = (form.locations ?? ['BOTH']).includes(loc);
              return (
                <button
                    key={loc}
                    type="button"
                    onClick={() => {
                        // 👉 Set korrekt typisieren + Fallback typisch machen
                        const cur = new Set<LocationKey>(form.locations ?? (['BOTH'] as LocationKey[]));
                        if (active && cur.size > 1) {
                        cur.delete(loc);
                        } else {
                        cur.add(loc);
                        }
                        // 👉 ergibt jetzt LocationKey[], nicht string[]
                        set('locations', Array.from(cur) as LocationKey[]);
                    }}
                    className={`rounded-full px-3 py-1 text-sm ring-1 ${
                        active ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white/5 ring-zinc-400/30'
                    }`}
                >
                    {loc}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Start (ISO)</label>
            <input type="date" className="rounded-md border px-3 py-2 bg-white dark:bg-zinc-900"
              value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Ende (ISO)</label>
            <input type="date" className="rounded-md border px-3 py-2 bg-white dark:bg-zinc-900"
              value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button disabled={saving} onClick={submit}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700 disabled:opacity-60">
            {saving ? 'Speichere…' : 'Speichern'}
          </button>
          {msg && <span className="text-sm opacity-80">{msg}</span>}
        </div>
      </div>
    </main>
  );
}
