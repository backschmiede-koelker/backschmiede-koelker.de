export type Event = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string;  // ISO
  location?: string;
  description?: string;
};

export const events: Event[] = [
  {
    id: 'brotbackkurs-1',
    title: 'Brotbackkurs - Sauerteig Basics',
    start: '2025-09-21T10:00:00+02:00',
    end: '2025-09-21T13:00:00+02:00',
    location: 'Mettingen - Backstube',
    description: 'Einführung in festen und flüssigen Sauerteig, Teigführung und Backen.'
  },
  {
    id: 'advent-verkauf',
    title: 'Adventsverkauf mit Stollenprobe',
    start: '2025-11-29T09:00:00+01:00',
    location: 'Recke - Filiale',
  },
];