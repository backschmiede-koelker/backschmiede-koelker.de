import { getISOWeek } from '../lib/time';

export type WeeklyItem = { name: string; price?: string; badge?: string };

const rotations: WeeklyItem[][] = [
  [
    { name: 'Bauernbrot 1kg', price: '€4,80' },
    { name: 'Roggenkruste 750g', price: '€3,90' },
    { name: 'Kartoffelbrot 1kg', price: '€5,10', badge: 'beliebt' },
  ],
  [
    { name: 'Dinkelvollkorn 1kg', price: '€5,40' },
    { name: 'Sonnenblumenbrot 750g', price: '€4,10' },
    { name: 'Kürbiskernbrot 1kg', price: '€5,60' },
  ],
  [
    { name: 'Mischbrot 1kg', price: '€4,60' },
    { name: 'Eiweißbrot 500g', price: '€3,70' },
    { name: 'Bergsteigerbrot 1kg', price: '€5,30' },
  ],
];

export function getWeeklyBread(date = new Date()) {
  const week = getISOWeek(date);
  const idx = week % rotations.length;
  return rotations[idx];
}