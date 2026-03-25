import { useState, useEffect, useMemo } from 'react';
import { ExperienceGrid } from './ExperienceGrid';

interface Experience {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  images?: string[];
  badge: string | null;
  categories: string[];
  price: number;
  type: 'business' | 'product';
  isOpenNow?: boolean;
  isOpenWeekend?: boolean;
  timeOfDay?: string[];
  popular?: boolean;
  lat: number;
  lng: number;
}

interface ExperienceContainerProps {
  selectedFilters: string[];
  darkMode?: boolean;
  isFilterOpen?: boolean;
  searchQuery?: string;
  selectedCategories?: string[];
  isOpenNow?: boolean;
  isOpenWeekend?: boolean;
  selectedTimeOfDay?: string[];
  nearMe?: boolean;
  experienceType?: string;
  groupType?: string;
  displayMode?: 'products' | 'businesses' | '';
  priceRange?: number;
  onFilteredCountChange?: (count: number) => void;
  showFavoritesOnly?: boolean;
}

// Shared experiences data
const experiences: Experience[] = [
  {
    id: 1,
    title: 'מצפה רמון',
    subtitle: 'המכתש הגדול בעולם',
    image: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1662961345124-c8f747c38181?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625310666597-891f2d527a5f?w=800&auto=format&fit=crop',
    ],
    badge: 'נקודת עניין',
    categories: ['attractions', 'hiking'],
    price: 0,
    type: 'product',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunrise', 'sunset'],
    popular: true,
    lat: 30.6103,
    lng: 34.8030,
  },
  {
    id: 2,
    title: 'חוות גמלים באר שבע',
    subtitle: 'רכיבה על גמלים',
    image: 'https://images.unsplash.com/photo-1591608516485-281dbe534b08?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1591608516485-281dbe534b08?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611676152004-207d43ae72ea?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['attractions'],
    price: 200,
    type: 'business',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunrise'],
    popular: false,
    lat: 31.2530,
    lng: 34.7915,
  },
  {
    id: 3,
    title: 'שוק הבדואים',
    subtitle: 'שוק אותנטי מסורתי',
    image: 'https://images.unsplash.com/photo-1595855759920-86dbee478ba4?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1595855759920-86dbee478ba4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1756361946964-f835b200d5d2?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['culture', 'food'],
    price: 50,
    type: 'product',
    isOpenNow: true,
    isOpenWeekend: false,
    timeOfDay: [],
    popular: true,
    lat: 31.2487,
    lng: 34.7905,
  },
  {
    id: 4,
    title: 'יקב רמת הנגב',
    subtitle: 'טעימות יין במדבר',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1633338001234-63ede6a2c0e9?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['food', 'culture'],
    price: 150,
    type: 'business',
    isOpenNow: false,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 31.1657,
    lng: 34.9121,
  },
  {
    id: 5,
    title: 'סדנת קדרות',
    subtitle: 'יצירה בחימר',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1676125105332-608345abe20e?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['culture', 'attractions'],
    price: 120,
    type: 'business',
    isOpenNow: false,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 30.9950,
    lng: 34.8612,
  },
  {
    id: 6,
    title: 'נחל צין',
    subtitle: 'טיול מים במדבר',
    image: 'https://images.unsplash.com/photo-1682687220499-d9a89c87d8b0?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1682687220499-d9a89c87d8b0?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1708647585211-255097b41449?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['hiking'],
    price: 0,
    type: 'product',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunrise'],
    popular: true,
    lat: 30.8331,
    lng: 35.1157,
  },
  {
    id: 7,
    title: 'עין עבדת',
    subtitle: 'מפל וברכה טבעית',
    image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509061078577-8c9adf4726d5?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1623965405244-25254325e3c1?w=800&auto=format&fit=crop',
    ],
    categories: ['hiking', 'attractions'],
    price: 30,
    type: 'product',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunrise', 'sunset'],
    popular: true,
    lat: 30.7976,
    lng: 34.7712,
  },
  {
    id: 8,
    title: 'פארק תמנע',
    subtitle: 'עמודי שלמה',
    image: 'https://images.unsplash.com/photo-1682687220211-c471118c9e92?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1682687220211-c471118c9e92?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1651464131804-0fd83c42a5d8?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['attractions'],
    price: 50,
    type: 'product',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunrise', 'sunset'],
    popular: true,
    lat: 29.7777,
    lng: 34.9819,
  },
  {
    id: 9,
    title: 'מצפה שיזפון',
    subtitle: 'נקודת תצפית',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625203802782-1a6654660581?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['hiking'],
    price: 0,
    type: 'product',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunrise', 'sunset'],
    popular: false,
    lat: 30.1234,
    lng: 35.0123,
  },
  {
    id: 10,
    title: 'חאן בארותיים',
    subtitle: 'אכסניה היסטורית',
    image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1746193587941-b103379a3b58?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['accommodation', 'culture'],
    price: 400,
    type: 'business',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['night'],
    popular: false,
    lat: 30.6542,
    lng: 34.9123,
  },
  {
    id: 11,
    title: 'ספארי ג\'יפים',
    subtitle: 'הרפתקה במדבר',
    image: 'https://images.unsplash.com/photo-1682687982167-d7fb1e2c2e73?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1682687982167-d7fb1e2c2e73?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547399899-14115e6a7773?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['attractions'],
    price: 350,
    type: 'business',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunrise', 'sunset'],
    popular: true,
    lat: 30.8876,
    lng: 34.7654,
  },
  {
    id: 12,
    title: 'טיול רכיבה',
    subtitle: 'סוסים במדבר',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1677640953114-0372b95de302?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['attractions', 'hiking'],
    price: 250,
    type: 'business',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunrise', 'sunset'],
    popular: false,
    lat: 31.1987,
    lng: 34.8321,
  },
  {
    id: 13,
    title: 'מרכז מבקרים',
    subtitle: 'מצפה רמון',
    image: 'https://images.unsplash.com/photo-1630389315920-d7a11667e981?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1630389315920-d7a11667e981?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1650732227605-ce5b954b793a?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['culture'],
    price: 40,
    type: 'business',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 30.6126,
    lng: 34.8015,
  },
  {
    id: 14,
    title: 'אוהל בדואי',
    subtitle: 'לינה אותנטית',
    image: 'https://images.unsplash.com/photo-1763544376867-7ad4e9e366cc?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1763544376867-7ad4e9e366cc?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1762255107395-bcb83548e83f?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['accommodation', 'culture'],
    price: 600,
    type: 'business',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['night'],
    popular: true,
    lat: 30.5432,
    lng: 35.0876,
  },
  {
    id: 15,
    title: 'ספא במדבר',
    subtitle: 'טיפולי רוגע',
    image: 'https://images.unsplash.com/photo-1562839938-ef837ead7478?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1562839938-ef837ead7478?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1762893133771-97468a68e240?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['attractions'],
    price: 300,
    type: 'business',
    isOpenNow: false,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 30.6987,
    lng: 34.8543,
  },
  {
    id: 16,
    title: 'מסעדה במדבר',
    subtitle: 'אוכל מסורתי',
    image: 'https://images.unsplash.com/photo-1697126248475-a537cc5cce28?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1697126248475-a537cc5cce28?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1765426369094-3ef411941c40?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['food'],
    price: 150,
    type: 'business',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunset'],
    popular: true,
    lat: 31.2321,
    lng: 34.7654,
  },
  {
    id: 17,
    title: 'צימרים ביער',
    subtitle: 'לינה יוקרתית',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1759281944533-a9eea164ffe3?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['accommodation'],
    price: 800,
    type: 'business',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['night'],
    popular: false,
    lat: 30.9123,
    lng: 34.9876,
  },
  {
    id: 18,
    title: 'אופני הרים',
    subtitle: 'מסלולי רכיבה',
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1635126039432-1742dbb90506?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['attractions', 'hiking'],
    price: 100,
    type: 'business',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['sunrise'],
    popular: false,
    lat: 30.7654,
    lng: 34.8321,
  },
  {
    id: 19,
    title: 'חניון לילה',
    subtitle: 'צפייה בכוכבים',
    image: 'https://images.unsplash.com/photo-1546814082-b5f4db989a4b?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1546814082-b5f4db989a4b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1637801566560-3819944934be?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['events', 'attractions'],
    price: 80,
    type: 'product',
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ['night'],
    popular: true,
    lat: 30.6234,
    lng: 34.7987,
  },
  {
    id: 20,
    title: 'מטע זיתים',
    subtitle: 'סדנת שמן זית',
    image: 'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1772257620461-69a0c30e0c71?w=800&auto=format&fit=crop',
    ],
    badge: null,
    categories: ['food', 'culture'],
    price: 120,
    type: 'business',
    isOpenNow: false,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 31.0876,
    lng: 34.8234,
  },
];

export function ExperienceContainer(props: ExperienceContainerProps) {
  const [favorites, setFavorites] = useState<number[]>(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Filter logic
  const filteredExperiences = useMemo(() => {
    return experiences.filter(exp => {
      // Favorites filter - check first
      if (props.showFavoritesOnly && !favorites.includes(exp.id)) return false;

      // Search query filter
      if (props.searchQuery && props.searchQuery.trim()) {
        const query = props.searchQuery.toLowerCase();
        if (!exp.title.toLowerCase().includes(query) && !exp.subtitle.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Categories filter
      if (props.selectedCategories && props.selectedCategories.length > 0) {
        const hasCategory = props.selectedCategories.some(cat => exp.categories.includes(cat));
        if (!hasCategory) return false;
      }

      // Display mode filter (business vs product)
      if (props.displayMode === 'businesses' && exp.type !== 'business') return false;
      if (props.displayMode === 'products' && exp.type !== 'product') return false;

      // Price range filter (only if displayMode is set)
      if (props.displayMode && props.priceRange && exp.price > props.priceRange) return false;

      // Open now filter
      if (props.isOpenNow && !exp.isOpenNow) return false;

      // Open weekend filter
      if (props.isOpenWeekend && !exp.isOpenWeekend) return false;

      // Time of day filter
      if (props.selectedTimeOfDay && props.selectedTimeOfDay.length > 0 && exp.timeOfDay) {
        const hasTimeOfDay = props.selectedTimeOfDay.some(time => exp.timeOfDay!.includes(time));
        if (!hasTimeOfDay) return false;
      }

      // Popular filter
      if (props.experienceType === 'popular' && !exp.popular) return false;

      return true;
    });
  }, [
    props.searchQuery,
    props.selectedCategories,
    props.displayMode,
    props.priceRange,
    props.isOpenNow,
    props.isOpenWeekend,
    props.selectedTimeOfDay,
    props.experienceType,
    props.showFavoritesOnly,
    favorites
  ]);

  // Update filtered count
  useEffect(() => {
    if (props.onFilteredCountChange) {
      props.onFilteredCountChange(filteredExperiences.length);
    }
  }, [filteredExperiences.length, props.onFilteredCountChange]);

  return (
    <ExperienceGrid
      {...props}
      showFavoritesOnly={props.showFavoritesOnly}
      favorites={favorites}
      toggleFavorite={toggleFavorite}
      filteredExperiences={filteredExperiences}
    />
  );
}