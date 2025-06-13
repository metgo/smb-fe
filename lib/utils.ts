import { category, navbar } from "@/constant/hebrew";
import { CalenderIcon, CtgAttractionIcon, CtgCultureIcon, CtgEatIcon, CtgLocalIcon, CtgLodgeIcon, CtgTourIcon, GalleryIcon, IntegratedIcon, KiteIcon, MapIcon, RoadmapArrowIcon, UserGroupIcon } from "@/components/ui/icons";

export const categoryGradientClasses: any = {
  eat: 'from-ctg-eat-dim via-ctg-eat-light to-ctg-eat-dim',
  local: 'from-ctg-local-dim via-ctg-local-light to-ctg-local-dim',
  lodge: 'from-ctg-lodge-dim via-ctg-lodge-light to-ctg-lodge-dim',
  culture: 'from-ctg-culture-dim via-ctg-culture-light to-ctg-culture-dim',
  attraction: 'from-ctg-attract-dim via-ctg-attract-light to-ctg-attract-dim',
  tour: 'from-ctg-tour-dim via-ctg-tour-light to-ctg-tour-dim',
};

export const categoryBgClasses: any = {
  eat: 'bg-ctg-eat-dark',
  local: 'bg-ctg-local-dark',
  lodge: 'bg-ctg-lodge-dark',
  culture: 'bg-ctg-culture-dark',
  attraction: 'bg-ctg-attract-dark',
  tour: 'bg-ctg-tour-dark',
};

export const categories = [
  {
    key: "tour",
    icon: CtgTourIcon,
    label: category.tours,
    bg: "bg-ctg-tour-dark"
  },
  {
    key: "attraction",
    icon: CtgAttractionIcon,
    label: category.attractions,
    bg: "bg-ctg-attract-dark"
  },
  {
    key: "eat",
    icon: CtgEatIcon,
    label: category.eater,
    bg: "bg-ctg-eat-dark"
  },
  {
    key: "culture",
    icon: CtgCultureIcon,
    label: category.culture,
    bg: "bg-ctg-culture-dark"
  },
  {
    key: "lodge",
    icon: CtgLodgeIcon,
    label: category.lodge,
    bg: "bg-ctg-lodge-dark"
  },
  {
    key: "local",
    icon: CtgLocalIcon,
    label: category.local,
    bg: "bg-ctg-local-dark"
  }
]

export const features = [
  {
    key: 1,
    label: navbar.funDays,
    icon: KiteIcon,
  },
  {
    key: 2,
    label: navbar.toGroups,
    icon: UserGroupIcon,
  },
  {
    key: 3,
    label: navbar.events,
    icon: CalenderIcon,
  },
  {
    key: 4,
    label: navbar.tracks,
    icon: RoadmapArrowIcon
  }
]

export const filterTabs = [
  {
    key: "gallery",
    label: navbar.gallery,
    icon: GalleryIcon
  },
  {
    key: "integrated",
    label: navbar.integrated,
    icon: IntegratedIcon
  },
  {
    key: "map",
    label: navbar.map,
    icon: MapIcon
  },
]

export const foodSubCategories = [
  { id: 1, label: "מסעדות" },        // Restaurants  
  { id: 2, label: "בתי קפה" },       // Cafés  
  { id: 3, label: "מאפיות" },        // Bakeries  
  { id: 4, label: "דוכני רחוב" },    // Street Food  
  { id: 5, label: "גלידריות" },       // Ice Cream Shops  
  { id: 6, label: "מסעדות טבעוניות" }, // Vegan Restaurants  
  { id: 7, label: "מסעדות כשרות" },  // Kosher Restaurants  
  { id: 8, label: "ברים ופאבים" },    // Bars & Pubs  
  { id: 9, label: "מסעדות אסיאתיות" }, // Asian Restaurants  
  { id: 10, label: "פוד טראקס" }     // Food Trucks
];