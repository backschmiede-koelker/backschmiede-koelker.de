export type DayDeal = {
  title: string;
  desc: string;
  price: string;
};

// Mo(1)–So(7)
export const dayDeals: Record<number, DayDeal> = {
  1: { title: 'Montags-Deal', desc: '5 Weizenbrötchen', price: '€1,80' },
  2: { title: 'Dienstags-Deal', desc: '3 Dinkelbrötchen', price: '€2,40' },
  3: { title: 'Mittwochs-Deal', desc: '2 Mischbrote', price: '€7,80' },
  4: { title: 'Donnerstags-Deal', desc: '2 Dinkelbrote + 5 Feierabendbrötchen', price: '€8,80 + €1,80' },
  5: { title: 'Freitags-Deal', desc: 'Rosinenbrot 500g', price: '€3,60' },
  6: { title: 'Samstags-Deal', desc: 'Kaffee & Stückchen', price: '€3,50' },
  7: { title: 'Sonntags-Deal', desc: 'Kuchenstücke -20%', price: 'variabel' },
};

export function getTodayDeal(date = new Date()) {
  const weekday = ((date.getDay() + 6) % 7) + 1; // Mo=1
  return dayDeals[weekday];
}