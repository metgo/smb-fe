import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  Briefcase,
  Car,
  Compass,
  Drama,
  Dumbbell,
  GraduationCap,
  Hammer,
  Scissors,
  ShoppingBag,
  Stethoscope,
  Utensils,
} from "lucide-react";

/**
 * Universal business categories taxonomy (12 areas -> subcategories), with
 * Hebrew and Arabic labels for the UI.
 *
 * `en` is the canonical name and must stay identical to
 * marketplace-be/src/modules/vendor-onboarding/business-taxonomy.ts: it is
 * what the onboarding sends to the profile generator, and what database
 * categories are matched on by name.
 */
export interface TaxonomyLabel {
  en: string;
  he: string;
  ar: string;
  /** Extra Hebrew words a vendor might search for. */
  keywords?: string;
}

export interface TaxonomyGroup extends TaxonomyLabel {
  icon: LucideIcon;
  /** Two or three familiar examples shown on the card. */
  examplesHe: string;
  examplesAr: string;
  examplesEn: string;
  subcategories: TaxonomyLabel[];
}

const s = (en: string, he: string, ar: string, keywords?: string) => ({
  en,
  he,
  ar,
  keywords,
});

/** Same order as the taxonomy CSV. */
export const BUSINESS_TAXONOMY: TaxonomyGroup[] = [
  {
    en: "Home & Trade Services",
    he: "בית ובעלי מקצוע",
    ar: "خدمات منزلية وحرفيون",
    icon: Hammer,
    examplesHe: "חשמלאי, אינסטלטור, גינון",
    examplesAr: "كهربائي، سباك، بستنة",
    examplesEn: "Electrician, plumber, gardening",
    subcategories: [
      s("Electrician", "חשמלאי", "كهربائي"),
      s("Plumber", "אינסטלטור", "سباك"),
      s("Painter", "צבעי", "دهّان"),
      s("HVAC & Heating", "מיזוג וחימום", "تكييف وتدفئة", "מזגנים"),
      s("Roofing", "גגות", "أسطح"),
      s("General Contractor", "קבלן שיפוצים", "مقاول عام", "שיפוצניק"),
      s("Handyman", "הנדימן", "عامل صيانة"),
      s("Carpenter", "נגר", "نجار"),
      s("Landscaping & Lawn Care", "גינון ופיתוח נוף", "تنسيق حدائق", "גנן"),
      s("House Cleaning", "ניקיון", "تنظيف منازل"),
      s("Pest Control", "הדברה", "مكافحة آفات"),
      s("Locksmith", "מנעולן", "صانع أقفال"),
      s("Flooring & Tile", "ריצוף וחיפוי", "أرضيات وبلاط"),
      s("Interior Designer", "עיצוב פנים", "مصمم داخلي"),
      s("Solar Installation", "מערכות סולאריות", "تركيب طاقة شمسية"),
    ],
  },
  {
    en: "Automotive",
    he: "רכב",
    ar: "سيارات",
    icon: Car,
    examplesHe: "מוסך, שטיפה, צמיגים",
    examplesAr: "كراج، غسيل، إطارات",
    examplesEn: "Garage, car wash, tires",
    subcategories: [
      s("Auto Repair & Mechanic", "מוסך", "كراج تصليح"),
      s("Auto Body & Collision", "פחחות וצבע", "سمكرة ودهان"),
      s("Tire Shop", "פנצ'רייה וצמיגים", "إطارات"),
      s("Oil Change", "החלפת שמן", "تغيير زيت"),
      s("Car Detailing & Wash", "שטיפה וניקוי רכב", "غسيل وتلميع سيارات"),
      s("Towing Service", "גרירה", "سحب سيارات"),
      s("Auto Glass", "שמשות לרכב", "زجاج سيارات"),
      s("Motorcycle Repair", "מוסך אופנועים", "تصليح دراجات نارية"),
      s("Dealership & Sales", "סוכנות ומכירת רכב", "وكالة وبيع سيارات"),
    ],
  },
  {
    en: "Professional & Legal",
    he: "שירותים מקצועיים ומשפטיים",
    ar: "خدمات مهنية وقانونية",
    icon: Briefcase,
    examplesHe: "עו״ד, רו״ח, נדל״ן",
    examplesAr: "محامٍ، محاسب، عقارات",
    examplesEn: "Lawyer, accountant, real estate",
    subcategories: [
      s("Law Firm & Attorney", "משרד עורכי דין", "مكتب محاماة", "עורך דין"),
      s("Notary", "נוטריון", "كاتب عدل"),
      s("Accountant & CPA", "רואה חשבון", "محاسب"),
      s("Tax Preparation", "יועץ מס", "مستشار ضرائب"),
      s("Financial Advisor", "ייעוץ פיננסי", "مستشار مالي"),
      s("Insurance Agency", "סוכנות ביטוח", "وكالة تأمين"),
      s("Real Estate Agent & Brokerage", "תיווך נדל״ן", "وساطة عقارية"),
      s("Business Consultant", "ייעוץ עסקי", "استشارات أعمال"),
      s("Architecture & Engineering", "אדריכלות והנדסה", "هندسة معمارية"),
      s("Marketing & PR", "שיווק ויחסי ציבור", "تسويق وعلاقات عامة", "פרסום"),
    ],
  },
  {
    en: "Health & Medical",
    he: "בריאות ורפואה",
    ar: "صحة وطب",
    icon: Stethoscope,
    examplesHe: "קליניקה, פיזיותרפיה",
    examplesAr: "عيادة، علاج طبيعي",
    examplesEn: "Clinic, physiotherapy",
    subcategories: [
      s("Primary Care & Clinic", "מרפאה", "عيادة"),
      s("Dental Clinic", "מרפאת שיניים", "عيادة أسنان"),
      s("Physical Therapy", "פיזיותרפיה", "علاج طبيعي"),
      s("Mental Health & Therapy", "טיפול רגשי ופסיכולוגי", "صحة نفسية وعلاج"),
      s("Chiropractor", "כירופרקטיקה", "معالج تقويم العمود الفقري"),
      s("Optometry & Eye Care", "אופטיקה", "بصريات", "משקפיים"),
      s("Pharmacy", "בית מרקחת", "صيدلية"),
      s("Dermatology", "רפואת עור", "أمراض جلدية"),
      s("Pediatrics", "רפואת ילדים", "طب أطفال"),
      s("Urgent Care", "רפואה דחופה", "رعاية عاجلة"),
      s(
        "Alternative Medicine / Acupuncture",
        "רפואה משלימה ודיקור",
        "طب بديل ووخز بالإبر",
        "נטורופתיה רפלקסולוגיה",
      ),
    ],
  },
  {
    en: "Food & Dining",
    he: "אוכל ומסעדות",
    ar: "طعام ومطاعم",
    icon: Utensils,
    examplesHe: "מסעדה, בית קפה, יקב",
    examplesAr: "مطعم، مقهى، معصرة نبيذ",
    examplesEn: "Restaurant, cafe, winery",
    subcategories: [
      s("Restaurant", "מסעדה", "مطعم", "אוכל ביסטרו"),
      s("Cafe & Coffee Shop", "בית קפה", "مقهى", "קפה"),
      s("Bakery & Pastry", "מאפייה וקונדיטוריה", "مخبز وحلويات", "עוגות"),
      s("Bar & Pub", "בר ופאב", "بار وحانة"),
      s("Brewery & Winery", "מבשלה ויקב", "مصنع جعة ومعصرة نبيذ", "יין בירה"),
      s("Food Truck", "פודטראק", "عربة طعام"),
      s("Catering", "קייטרינג", "تموين"),
      s("Juice & Smoothie Bar", "בר מיצים ושייקים", "بار عصائر وسموذي"),
      s(
        "Specialty Grocery & Deli",
        "מעדנייה ומכולת ייחודית",
        "بقالة مميزة وأطعمة جاهزة",
        "גבינות חוות מוצרי חלב",
      ),
    ],
  },
  {
    en: "Hospitality & Lodging",
    he: "אירוח ולינה",
    ar: "ضيافة ومبيت",
    icon: BedDouble,
    examplesHe: "צימר, מלון, קמפינג",
    examplesAr: "نزل، فندق، تخييم",
    examplesEn: "B&B, hotel, camping",
    subcategories: [
      s("Hotel", "מלון", "فندق"),
      s("Boutique Motel", "מוטל בוטיק", "موتيل بوتيك", "מלון בוטיק"),
      s("Resort", "ריזורט", "منتجع", "נופש"),
      s(
        "Bed & Breakfast",
        "לינה וארוחת בוקר (צימר)",
        "مبيت وفطور",
        "צימר צימרים בית הארחה",
      ),
      s("Vacation Rental", "דירת נופש", "شقة عطلات", "וילה"),
      s("Hostel", "אכסניה", "نزل شبابي", "הוסטל"),
      s(
        "Campground & RV Park",
        "קמפינג וחניון קרוואנים",
        "مخيم وموقف كرفانات",
        "אוהלים גלמפינג חושות",
      ),
      s("Extended Stay", "שהייה ארוכה", "إقامة طويلة"),
    ],
  },
  {
    en: "Travel & Transportation",
    he: "תיירות ותחבורה",
    ar: "سياحة ومواصلات",
    icon: Compass,
    examplesHe: "סיורים, השכרת אופניים",
    examplesAr: "جولات، تأجير دراجات",
    examplesEn: "Tours, bike rental",
    subcategories: [
      s(
        "Tour Operator",
        "מפעיל סיורים",
        "منظم جولات",
        "סיורים טיולים ג'יפים מדריך",
      ),
      s("Travel Agency", "סוכנות נסיעות", "وكالة سفر"),
      s("Airport Shuttle", "הסעות לשדה התעופה", "نقل إلى المطار", "הסעות"),
      s("Car Rental", "השכרת רכב", "تأجير سيارات"),
      s("Boat Rental & Charter", "השכרת סירות", "تأجير قوارب"),
      s(
        "Taxi & Limousine Service",
        "מוניות ולימוזינות",
        "سيارات أجرة وليموزين",
      ),
      s(
        "Bike & Scooter Rental",
        "השכרת אופניים וקורקינטים",
        "تأجير دراجات وسكوترات",
      ),
      s("Cruise Line", "חברת שייט", "خط رحلات بحرية"),
    ],
  },
  {
    en: "Arts Entertainment & Culture",
    he: "אמנות, בידור ותרבות",
    ar: "فنون وترفيه وثقافة",
    icon: Drama,
    examplesHe: "גלריה, מוזיאון, הופעות",
    examplesAr: "معرض، متحف، عروض",
    examplesEn: "Gallery, museum, shows",
    subcategories: [
      s("Museum", "מוזיאון", "متحف"),
      s("Art Gallery", "גלריה לאמנות", "معرض فني", "אמנים סטודיו"),
      s(
        "Theater & Performing Arts",
        "תיאטרון ואמנויות הבמה",
        "مسرح وفنون أداء",
      ),
      s(
        "Live Music Venue",
        "מקום להופעות חיות",
        "مكان عروض موسيقية حية",
        "מוזיקה מועדון",
      ),
      s("Cinema", "קולנוע", "سينما"),
      s("Historical Site", "אתר היסטורי", "موقع تاريخي", "מורשת עתיקות"),
      s(
        "Amusement & Water Park",
        "פארק שעשועים ומים",
        "مدينة ملاهٍ ومائية",
        "אטרקציות",
      ),
      s("Escape Room", "חדר בריחה", "غرفة هروب"),
      s("Event Venue", "מתחם אירועים", "قاعة مناسبات", "אולם חתונות"),
    ],
  },
  {
    en: "Retail & Shopping",
    he: "קניות וחנויות",
    ar: "تسوق ومتاجر",
    icon: ShoppingBag,
    examplesHe: "בגדים, מתנות, פרחים",
    examplesAr: "ملابس، هدايا، زهور",
    examplesEn: "Clothing, gifts, flowers",
    subcategories: [
      s("Clothing & Apparel", "ביגוד והלבשה", "ملابس وأزياء", "בגדים אופנה"),
      s("Grocery & Supermarket", "מכולת וסופרמרקט", "بقالة وسوبرماركت"),
      s("Electronics & Tech", "אלקטרוניקה", "إلكترونيات"),
      s("Home Goods & Furniture", "כלי בית וריהוט", "أدوات منزلية وأثاث"),
      s("Bookshop", "חנות ספרים", "مكتبة لبيع الكتب"),
      s("Jewelry", "תכשיטים", "مجوهرات"),
      s("Florist", "חנות פרחים", "محل زهور"),
      s("Hardware & Tools", "חומרי בניין וכלי עבודה", "أدوات وعدد"),
      s(
        "Gift & Souvenir Shop",
        "מתנות ומזכרות",
        "هدايا وتذكارات",
        "יודאיקה קרמיקה",
      ),
    ],
  },
  {
    en: "Beauty & Personal Care",
    he: "יופי וטיפוח",
    ar: "جمال وعناية",
    icon: Scissors,
    examplesHe: "ספא, מספרה, קוסמטיקה",
    examplesAr: "سبا، صالون، تجميل",
    examplesEn: "Spa, salon, cosmetics",
    subcategories: [
      s("Hair Salon", "מספרה", "صالون شعر"),
      s("Barbershop", "ברברשופ", "حلاق رجالي"),
      s("Nail Salon", "מניקור ופדיקור", "صالون أظافر", "ציפורניים"),
      s("Day Spa", "ספא", "سبا"),
      s("Massage Therapy", "עיסוי", "مساج", "מסאז'"),
      s(
        "Esthetician & Skin Care",
        "קוסמטיקה וטיפוח העור",
        "تجميل والعناية بالبشرة",
      ),
      s("Tattoo & Piercing", "קעקועים ופירסינג", "وشم وثقب"),
      s("Makeup Artist", "איפור", "خبيرة مكياج"),
    ],
  },
  {
    en: "Fitness & Recreation",
    he: "כושר ופנאי",
    ar: "لياقة وترفيه",
    icon: Dumbbell,
    examplesHe: "סטודיו, יוגה, טיפוס",
    examplesAr: "استوديو، يوغا، تسلق",
    examplesEn: "Studio, yoga, climbing",
    subcategories: [
      s("Gym & Fitness Center", "חדר כושר", "نادٍ رياضي"),
      s(
        "Yoga & Pilates Studio",
        "סטודיו ליוגה ופילאטיס",
        "استوديو يوغا وبيلاتس",
      ),
      s("Martial Arts", "אומנויות לחימה", "فنون قتالية"),
      s("Personal Trainer", "מאמן אישי", "مدرب شخصي"),
      s("Climbing Gym", "קיר טיפוס", "صالة تسلق"),
      s("Dance Studio", "סטודיו למחול", "استوديو رقص", "ריקוד"),
      s("Swimming Facility", "בריכה", "مسبح", "שחייה"),
      s(
        "Sports Club & League",
        "מועדון ספורט",
        "نادٍ رياضي وفرق",
        "רכיבה סוסים",
      ),
    ],
  },
  {
    en: "Education Community & Pets",
    he: "חינוך, קהילה וחיות מחמד",
    ar: "تعليم ومجتمع وحيوانات",
    icon: GraduationCap,
    examplesHe: "חוגים, שיעורים, וטרינר",
    examplesAr: "دورات، دروس، بيطري",
    examplesEn: "Classes, lessons, vet",
    subcategories: [
      s("Tutoring & Test Prep", "שיעורים פרטיים", "دروس خصوصية"),
      s("Daycare & Preschool", "מעון וגן ילדים", "حضانة وروضة"),
      s(
        "Music / Language School",
        "בית ספר למוזיקה או לשפות",
        "مدرسة موسيقى أو لغات",
        "חוגים",
      ),
      s("Veterinary Clinic", "מרפאה וטרינרית", "عيادة بيطرية", "וטרינר"),
      s(
        "Pet Grooming & Boarding",
        "טיפוח ופנסיון לחיות",
        "تجميل وفندقة حيوانات",
        "פנסיון כלבים",
      ),
      s("Dog Walking", "דוגווקר", "تمشية كلاب"),
      s("Community Center", "מרכז קהילתי", "مركز مجتمعي", 'מתנ"ס'),
      s("Non-Profit Organization", "עמותה", "جمعية غير ربحية"),
    ],
  },
];

export const MAX_CATEGORY_GROUPS = 3;

export type TaxonomyLanguage = "he" | "en" | "ar";

export const taxonomyLabel = (
  item: Pick<TaxonomyLabel, "en" | "he" | "ar">,
  language: string,
) => (language === "he" ? item.he : language === "ar" ? item.ar : item.en);

export const groupExamples = (g: TaxonomyGroup, language: string) =>
  language === "he"
    ? g.examplesHe
    : language === "ar"
      ? g.examplesAr
      : g.examplesEn;

export const findGroup = (en: string) =>
  BUSINESS_TAXONOMY.find((g) => g.en === en);

/** The area a subcategory belongs to (subcategory names are unique). */
export const groupOfSubcategory = (subEn: string) =>
  BUSINESS_TAXONOMY.find((g) => g.subcategories.some((x) => x.en === subEn));

export const findSubcategory = (subEn: string) =>
  groupOfSubcategory(subEn)?.subcategories.find((x) => x.en === subEn);

/** Lower-case, "&" as "and", punctuation and geresh stripped. */
export const nameKey = (v: string | undefined | null) =>
  (v ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/**
 * The taxonomy area that a database category stands for, matched on its
 * English or Hebrew name. Used to give the old category cards an icon and a
 * translated label.
 */
export const groupForDbCategory = (cat: {
  name?: string;
  hebrewName?: string;
  nameHe?: string;
}) => {
  const keys = [cat.name, cat.hebrewName, cat.nameHe].map(nameKey);
  return BUSINESS_TAXONOMY.find((g) =>
    keys.some((k) => k && (k === nameKey(g.en) || k === nameKey(g.he))),
  );
};

export interface SubcategoryHit {
  group: TaxonomyGroup;
  sub: TaxonomyLabel;
}

/** Search subcategories (and areas) in every language plus keywords. */
export function searchTaxonomy(query: string, limit = 8): SubcategoryHit[] {
  const q = nameKey(query);
  if (q.length < 2) return [];
  const hits: { hit: SubcategoryHit; score: number }[] = [];
  for (const group of BUSINESS_TAXONOMY) {
    const groupText = nameKey(`${group.he} ${group.en} ${group.ar}`);
    for (const sub of group.subcategories) {
      const label = nameKey(`${sub.he} ${sub.en} ${sub.ar}`);
      const extra = nameKey(sub.keywords);
      const score = label.split(" ").some((w) => w.startsWith(q))
        ? 3
        : label.includes(q)
          ? 2
          : extra.includes(q)
            ? 1.5
            : groupText.includes(q)
              ? 0.5
              : 0;
      if (score) hits.push({ hit: { group, sub }, score });
    }
  }
  return hits
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((h) => h.hit);
}
