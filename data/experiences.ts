export type OpeningHours = {
  open: string;
  close: string;
};

export type Experience = {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  logo: string;
  location: string;
  phone: string;
  email: string;
  gallery: string[];
  openingHours: Record<string, OpeningHours | null>;
  groupType?: string[];
  accessibility?: string[];
  amenities?: string[];
};

export const experiencesData: Experience[] = [
  {
    id: 1,
    title: 'מכתש רמון',
    subtitle: 'פארק הטבע הגדול בישראל',
    description: 'מכתש רמון הוא הוואדי הגדול בעולם. בואו לגלות את יופיו המדברי הייחודי.',
    logo: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=200&h=200&fit=crop',
    location: 'מצפה רמון, ישראל',
    phone: '08-9588691',
    email: 'info@ramoncrater.co.il',
    gallery: [
      'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1662961345124-c8f747c38181?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1625310666597-891f2d527a5f?w=1200&h=800&fit=crop',
    ],
    openingHours: {
      sunday:    { open: '08:00', close: '17:00' },
      monday:    { open: '08:00', close: '17:00' },
      tuesday:   { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday:  { open: '08:00', close: '17:00' },
      friday:    { open: '08:00', close: '14:00' },
      saturday:  null,
    },
    groupType: ['משפחות', 'זוגות', 'קבוצות'],
    accessibility: ['נגיש לכיסאות גלגלים'],
    amenities: ['חניה', 'ידידותי לחיות'],
  },
];
