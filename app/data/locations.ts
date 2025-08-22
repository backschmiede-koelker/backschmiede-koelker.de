export type FallbackHours = {
  weekday_text: string[]; 
};

export const locations = {
  mettingen: {
    label: 'Mettingen',
    placeId: process.env.PLACES_METTINGEN_PLACE_ID!,
    fallback: {
      weekday_text: [
        'Montag: 07:00-12:30',
        'Dienstag: 07:00-12:30, 14:30-18:00',
        'Mittwoch: 07:00-12:30, 14:30-18:00',
        'Donnerstag: 07:00-12:30, 14:30-18:00',
        'Freitag: 07:00-12:30, 14:30-18:00',
        'Samstag: 07:00-12:30',
        'Sonntag: 08:00-11:00',
      ],
    } as FallbackHours,
  },
  recke: {
    label: 'Recke',
    placeId: process.env.PLACES_RECKE_PLACE_ID!,
    fallback: {
      weekday_text: [
        'Montag: 06:00-18:00',
        'Dienstag: 06:00-18:00',
        'Mittwoch: 06:00-18:00',
        'Donnerstag: 06:00-18:00',
        'Freitag: 06:00-18:00',
        'Samstag: 06:00-18:00',
        'Sonntag: 07:00-17:00',
      ],
    } as FallbackHours,
  },
};

export type LocationKey = keyof typeof locations;