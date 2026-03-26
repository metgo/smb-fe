import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MapPin, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

interface Experience {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  images?: string[]; // Multiple images for carousel
  badge: string | null;
  categories: string[];
  price: number;
  type: "business" | "product";
  isOpenNow?: boolean;
  isOpenWeekend?: boolean;
  timeOfDay?: string[];
  popular?: boolean;
  lat: number;
  lng: number;
}

interface ExperienceGridProps {
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
  displayMode?: "products" | "businesses" | "";
  priceRange?: number;
  onFilteredCountChange?: (count: number) => void;
  showFavoritesOnly?: boolean;
  favorites?: number[];
  toggleFavorite?: (id: number) => void;
  filteredExperiences?: Experience[];
}

const experiences: Experience[] = [
  {
    id: 1,
    title: "מצפה רמון",
    subtitle: "המכתש הגדול בעולם",
    image:
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1662961345124-c8f747c38181?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1625310666597-891f2d527a5f?w=800&auto=format&fit=crop",
    ],
    badge: "נקודת עניין",
    categories: ["attractions", "hiking"],
    price: 0,
    type: "product",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunrise", "sunset"],
    popular: true,
    lat: 31.046051,
    lng: 34.851612,
  },
  {
    id: 2,
    title: "חוות גמלים באר שבע",
    subtitle: "רכיבה על גמלים",
    image:
      "https://images.unsplash.com/photo-1611676152004-207d43ae72ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lbCUyMGRlc2VydCUyMHJpZGV8ZW58MXx8fHwxNzczNzMzMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1611676152004-207d43ae72ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lbCUyMGRlc2VydCUyMHJpZGV8ZW58MXx8fHwxNzczNzMzMDc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1591608516485-281dbe534b08?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["attractions"],
    price: 200,
    type: "business",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunrise"],
    popular: false,
    lat: 31.233333,
    lng: 35.216667,
  },
  {
    id: 3,
    title: "שוק הבדואים",
    subtitle: "שוק אותנטי מסורתי",
    image:
      "https://images.unsplash.com/photo-1595855759920-86dbee478ba4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1761289731268-900eba5cf09f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMG1hcmtldCUyMHNwaWNlc3xlbnwxfHx8fDE3NzM3MzMwODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1595855759920-86dbee478ba4?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["culture", "food"],
    price: 50,
    type: "product",
    isOpenNow: true,
    isOpenWeekend: false,
    timeOfDay: [],
    popular: true,
    lat: 31.251366,
    lng: 34.795496,
  },
  {
    id: 4,
    title: "יקב רמת הנגב",
    subtitle: "טעימות יין במדבר",
    image:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1739660283528-dc336e489cd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lcnklMjB2aW5leWFyZCUyMGdyYXBlc3xlbnwxfHx8fDE3NzM3MzMwODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["food", "culture"],
    price: 150,
    type: "business",
    isOpenNow: false,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 5,
    title: "סדנת קדרות",
    subtitle: "יצירה בחימר",
    image:
      "https://images.unsplash.com/photo-1719139830243-766eb3837646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBwb3R0ZXJ5JTIwY2VyYW1pY3N8ZW58MXx8fHwxNzczNzMzMDgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1719139830243-766eb3837646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBwb3R0ZXJ5JTIwY2VyYW1pY3N8ZW58MXx8fHwxNzczNzMzMDgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["culture", "attractions"],
    price: 120,
    type: "business",
    isOpenNow: false,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 6,
    title: "נחל צין",
    subtitle: "טיול מים במדבר",
    image:
      "https://images.unsplash.com/photo-1633088926847-435cdb7e76da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBjYW55b24lMjBpc3JhZWwlMjBuZWdldnxlbnwxfHx8fDE3NzM3MzMwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1633088926847-435cdb7e76da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBjYW55b24lMjBpc3JhZWwlMjBuZWdldnxlbnwxfHx8fDE3NzM3MzMwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1682687220499-d9a89c87d8b0?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["hiking"],
    price: 0,
    type: "product",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunrise"],
    popular: true,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 7,
    title: "עין עבדת",
    subtitle: "מפל וברכה טבעית",
    image:
      "https://images.unsplash.com/photo-1509061078577-8c9adf4726d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBvYXNpcyUyMHdhdGVyZmFsbHxlbnwxfHx8fDE3NzM3MzMwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1509061078577-8c9adf4726d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBvYXNpcyUyMHdhdGVyZmFsbHxlbnwxfHx8fDE3NzM3MzMwNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1623965405244-25254325e3c1?w=800&auto=format&fit=crop",
    ],
    badge: "מומלץ",
    categories: ["hiking", "attractions"],
    price: 30,
    type: "product",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunrise", "sunset"],
    popular: true,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 8,
    title: "פארק תמנע",
    subtitle: "עמודי שלמה",
    image:
      "https://images.unsplash.com/photo-1632409329091-5d543d397398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjByb2NrJTIwZGVzZXJ0JTIwZm9ybWF0aW9uc3xlbnwxfHx8fDE3NzM3MzMwNzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1632409329091-5d543d397398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjByb2NrJTIwZGVzZXJ0JTIwZm9ybWF0aW9uc3xlbnwxfHx8fDE3NzM3MzMwNzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1682687220211-c471118c9e92?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["attractions"],
    price: 50,
    type: "product",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunrise", "sunset"],
    popular: true,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 9,
    title: "מצפה שיזפון",
    subtitle: "נקודת תצפית",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1625203802782-1a6654660581?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["hiking"],
    price: 0,
    type: "product",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunrise", "sunset"],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 10,
    title: "חאן בארותיים",
    subtitle: "אכסניה היסטורית",
    image:
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1746193587941-b103379a3b58?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["accommodation", "culture"],
    price: 400,
    type: "business",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["night"],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 11,
    title: "ספארי ג'יפים",
    subtitle: "הרפתקה במדבר",
    image:
      "https://images.unsplash.com/photo-1682687982167-d7fb1e2c2e73?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1682687982167-d7fb1e2c2e73?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547399899-14115e6a7773?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["attractions"],
    price: 350,
    type: "business",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunrise", "sunset"],
    popular: true,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 12,
    title: "טיול רכיבה",
    subtitle: "סוסים במדבר",
    image:
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1677640953114-0372b95de302?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["attractions", "hiking"],
    price: 250,
    type: "business",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunrise", "sunset"],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 13,
    title: "מרכז מבקרים",
    subtitle: "מצפה רמון",
    image:
      "https://images.unsplash.com/photo-1630389315920-d7a11667e981?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1630389315920-d7a11667e981?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1650732227605-ce5b954b793a?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["culture"],
    price: 40,
    type: "business",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 14,
    title: "אוהל בדואי",
    subtitle: "לינה אותנטית",
    image:
      "https://images.unsplash.com/photo-1763544376867-7ad4e9e366cc?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1763544376867-7ad4e9e366cc?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1762255107395-bcb83548e83f?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["accommodation", "culture"],
    price: 600,
    type: "business",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["night"],
    popular: true,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 15,
    title: "ספא במדבר",
    subtitle: "טיפולי רוגע",
    image:
      "https://images.unsplash.com/photo-1562839938-ef837ead7478?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1562839938-ef837ead7478?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1762893133771-97468a68e240?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["attractions"],
    price: 300,
    type: "business",
    isOpenNow: false,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 16,
    title: "מסעדה במדבר",
    subtitle: "אוכל מסורתי",
    image:
      "https://images.unsplash.com/photo-1697126248475-a537cc5cce28?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1697126248475-a537cc5cce28?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1765426369094-3ef411941c40?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["food"],
    price: 150,
    type: "business",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunset"],
    popular: true,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 17,
    title: "צימרים ביער",
    subtitle: "לינה יוקרתית",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1759281944533-a9eea164ffe3?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["accommodation"],
    price: 800,
    type: "business",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["night"],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 18,
    title: "אופני הרים",
    subtitle: "מסלולי רכיבה",
    image:
      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1635126039432-1742dbb90506?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["attractions", "hiking"],
    price: 100,
    type: "business",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["sunrise"],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 19,
    title: "חניון לילה",
    subtitle: "צפייה בכוכבים",
    image:
      "https://images.unsplash.com/photo-1546814082-b5f4db989a4b?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1546814082-b5f4db989a4b?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1637801566560-3819944934be?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["events", "attractions"],
    price: 80,
    type: "product",
    isOpenNow: true,
    isOpenWeekend: true,
    timeOfDay: ["night"],
    popular: true,
    lat: 31.165694,
    lng: 34.912064,
  },
  {
    id: 20,
    title: "מטע זיתים",
    subtitle: "סדנת שמן זית",
    image:
      "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1772257620461-69a0c30e0c71?w=800&auto=format&fit=crop",
    ],
    badge: null,
    categories: ["food", "culture"],
    price: 120,
    type: "business",
    isOpenNow: false,
    isOpenWeekend: true,
    timeOfDay: [],
    popular: false,
    lat: 31.165694,
    lng: 34.912064,
  },
];

export function ExperienceGrid({
  selectedFilters,
  darkMode,
  isFilterOpen,
  searchQuery = "",
  selectedCategories = [],
  isOpenNow = false,
  isOpenWeekend = false,
  selectedTimeOfDay = [],
  nearMe = false,
  experienceType = "",
  groupType = "",
  displayMode = "",
  priceRange = 1000,
  onFilteredCountChange,
  showFavoritesOnly = false,
  favorites = [],
  toggleFavorite = (id: number) => {},
  filteredExperiences = [],
}: ExperienceGridProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<{
    [key: number]: number;
  }>({});
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>(
    {},
  );
  const navigate = useNavigate();

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const nextImage = (e: React.MouseEvent, id: number, totalImages: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % totalImages,
    }));
  };

  const prevImage = (e: React.MouseEvent, id: number, totalImages: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  // Use filtered experiences from props
  const displayExperiences = filteredExperiences;

  // Update filtered count
  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(displayExperiences.length);
    }
  }, [displayExperiences.length, onFilteredCountChange]);

  const handleCardClick = (id: number) => {
    // Save scroll position before navigating
    sessionStorage.setItem("homeScrollPosition", window.scrollY.toString());
    navigate(`/business/${id}`);
  };

  // Function to get card height based on index pattern
  const getCardHeight = (index: number): string => {
    const heights = ["190px", "220px", "408px"];
    return heights[index % heights.length];
  };

  return (
    <section
      className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{ minHeight: "calc(100vh - 120px)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Empty State for Favorites */}
        {showFavoritesOnly && displayExperiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Heart
              className={`w-16 h-16 mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`}
            />
            <p
              className={`text-xl ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              עוד לא סימנת מועדפים, הגיע הזמן :)
            </p>
          </div>
        ) : (
          <>
            {/* Grid - Responsive with app-like spacing */}
            <ResponsiveMasonry
              columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}
            >
              <Masonry gutter="16px">
                {displayExperiences.map((experience, index) => (
                  <motion.div
                    key={experience.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: index * 0.02,
                    }}
                    className="group"
                    layout
                    style={{ willChange: "opacity, transform" }}
                  >
                    <motion.div
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      onClick={() => handleCardClick(experience.id)}
                      className={`relative overflow-hidden rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
                        darkMode ? "bg-slate-800" : "bg-white"
                      }`}
                      style={{
                        willChange: "transform, box-shadow",
                        height: getCardHeight(index),
                      }}
                    >
                      {/* Image */}
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        src={
                          experience.images
                            ? experience.images[
                                currentImageIndex[experience.id] || 0
                              ]
                            : experience.image
                        }
                        alt={experience.title}
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad(experience.id)}
                      />

                      {/* Gradient Overlay at Bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Carousel Navigation */}
                      {experience.images && experience.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) =>
                              prevImage(
                                e,
                                experience.id,
                                experience.images!.length,
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg z-10 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-800" />
                          </button>
                          <button
                            onClick={(e) =>
                              nextImage(
                                e,
                                experience.id,
                                experience.images!.length,
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg z-10 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-800" />
                          </button>
                          {/* Dots indicator */}
                          <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {experience.images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  idx ===
                                  (currentImageIndex[experience.id] || 0)
                                    ? "bg-white w-4"
                                    : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Content at Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                        <h3 className="font-bold text-sm sm:text-base mb-0.5 sm:mb-1 drop-shadow-lg line-clamp-2">
                          {experience.title}
                        </h3>
                        {experience.subtitle && (
                          <p className="text-xs text-white/90 drop-shadow-md flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {experience.subtitle}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Badge - Top Right */}
                      {experience.badge && (
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/95 backdrop-blur-sm text-gray-800 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {experience.badge}
                        </div>
                      )}

                      {/* Favorite Button - Top Left - Larger touch target for mobile */}
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(experience.id);
                        }}
                        className={`absolute top-2 sm:top-3 left-2 sm:left-3 p-2.5 sm:p-2 rounded-full shadow-lg z-10 backdrop-blur-sm transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
                          favorites.includes(experience.id)
                            ? "bg-white/95"
                            : "bg-black/20 hover:bg-black/30"
                        }`}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div
                          key={
                            favorites.includes(experience.id)
                              ? "favorited"
                              : "not-favorited"
                          }
                          initial={
                            favorites.includes(experience.id)
                              ? { scale: 1, rotate: 0 }
                              : false
                          }
                          animate={
                            favorites.includes(experience.id)
                              ? {
                                  scale: [1, 1.4, 1],
                                  rotate: [0, -15, 15, -10, 0],
                                }
                              : { scale: 1, rotate: 0 }
                          }
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                          }}
                        >
                          <Heart
                            className={`w-5 h-5 sm:w-4 sm:h-4 transition-all duration-300 ${
                              favorites.includes(experience.id)
                                ? "fill-red-500 text-red-500"
                                : "text-white"
                            }`}
                          />
                        </motion.div>
                      </motion.button>
                    </motion.div>
                  </motion.div>
                ))}
              </Masonry>
            </ResponsiveMasonry>

            {/* No results message */}
            {displayExperiences.length === 0 && (
              <div
                className={`text-center py-16 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                <p className="text-xl font-medium mb-2">
                  לא נמצאו חוויות מתאימות
                </p>
                <p className="text-sm">נסה לשנות את הפילטרים שלך</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
