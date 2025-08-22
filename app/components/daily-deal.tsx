'use client';
import { useEffect, useState } from 'react';
import { getTodayDeal } from '../data/offers';
import { fmtDate } from '../lib/time';

export default function DailyDeal() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const deal = getTodayDeal(now);
  return (
    <div className="rounded-2xl p-5 bg-green-600/10 dark:bg-green-400/10 border border-green-600/20">
      <p className="text-xs opacity-70">Heutiges Angebot – {fmtDate(now, { weekday: 'long', day: '2-digit', month: '2-digit' })}</p>
      <h3 className="text-xl font-bold">{deal.title}</h3>
      <p className="text-sm">{deal.desc} · <span className="font-semibold">{deal.price}</span></p>
    </div>
  );
}