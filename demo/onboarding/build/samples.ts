/**
 * Demo-only sample data for the Workspace onboarding demo: the businesses of
 * the "owner@demo.co" account, and one-click onboarding presets.
 * Not part of the product code: build-demo.sh copies it in.
 */
import type { OnboardingDraft } from "@/pages/onboarding/types";
import {
  BUSINESS_TAXONOMY,
  findSubcategory,
  groupOfSubcategory,
} from "@/lib/businessTaxonomy";

/** Database id of a taxonomy area in the fake backend. */
export const catId = (area: string) =>
  `cat-${area.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")}`;

/** The fake database categories: exactly the 12 areas of the taxonomy CSV. */
export const DB_CATEGORIES = BUSINESS_TAXONOMY.map((g) => ({
  _id: catId(g.en),
  name: g.en,
  hebrewName: g.he,
  icon: { iconPath: "https://storage.invalid/missing-icon.png", iconAlt: g.en },
}));

/**
 * Classify a sample business the way onboarding saves it: the main
 * subcategory's area is the primary category, every chosen area is linked,
 * and the subcategories are kept as Hebrew tags, main first.
 */
const classify = (main: string, ...others: string[]) => {
  const subs = [main, ...others];
  for (const x of subs)
    if (!findSubcategory(x)) throw new Error(`Not in the taxonomy: ${x}`);
  const areas = [...new Set(subs.map((x) => groupOfSubcategory(x)!.en))];
  return {
    primaryCategoryId: catId(areas[0]),
    bussCategoriesId: areas.map(catId),
    tagsId: subs.map((x) => findSubcategory(x)!.he),
    internalNotes: `Business type: ${areas
      .map((a) => `${a} (${subs.filter((x) => groupOfSubcategory(x)!.en === a).join(", ")})`)
      .join("; ")}`,
  };
};

/** A soft gradient cover with an emoji, so sample cards have a picture. */
const cover = (from: string, to: string, emoji: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
      `<rect width="640" height="420" fill="url(#g)"/>` +
      `<text x="320" y="250" font-size="150" text-anchor="middle">${emoji}</text></svg>`,
  );

const img = (from: string, to: string, emoji: string) => [
  { image: cover(from, to, emoji), previewUrl: cover(from, to, emoji), isPrimary: true },
];

const week = (open: string, close: string, closedDays: string[] = []) =>
  ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) =>
    closedDays.includes(day)
      ? { day, open: "", close: "", isHoliday: true, byAppointment: false }
      : { day, open, close, isHoliday: false, byAppointment: false },
  );

const base = {
  authorityId: "auth-ramat-negev",
  dmoId: "dmo-negev",
  associatedWebsiteIds: ["site-negev"],
  userId: { _id: "demo-owner", firstName: "יואב", lastName: "לוי", email: "owner@demo.co", role: "traveller" },
};

/** Businesses that already exist for the "owner" demo account. */
export const SAMPLE_BUSINESSES: any[] = [
  {
    _id: "sample-winery",
    name: "יקב נחל צין",
    status: "APPROVED",
    shortDescription: "יקב בוטיק משפחתי בלב המדבר, טעימות יין עם נוף לנחל צין וגבינות מקומיות.",
    description:
      "<p>יקב משפחתי קטן שמגדל ענבים בתנאי מדבר ומייצר כ-15 אלף בקבוקים בשנה.</p><p>הטעימות נערכות במרפסת מול הנוף, עם מגש גבינות של מחלבה שכנה. אפשר להצטרף לסיור בכרם בשעות הבוקר.</p>",
    ...classify("Brewery & Winery", "Specialty Grocery & Deli"),
    accessibilitiesId: ["acc-parking", "acc-wc"],
    groupTypesId: ["grp-couples", "grp-groups"],
    phoneNumber: "052-4417820",
    busiEmail: "hello@zin-winery.co.il",
    address: { country: "ישראל", city: "מדרשת בן גוריון", location: "דרך הנחל 4" },
    geoLocation: { lat: "30.8530", long: "34.7830" },
    openingHrs: week("10:00", "18:00", ["SAT"]),
    images: img("#7c2d12", "#f59e0b", "🍷"),
    createdAt: "2026-08-02T09:00:00.000Z",
  },
  {
    _id: "sample-bnb",
    name: "צימר אבני המדבר",
    status: "APPROVED",
    shortDescription: "שלוש בקתות אבן עם ג׳קוזי פרטי ושמיים מלאי כוכבים, עשר דקות מהמכתש.",
    description:
      "<p>שלוש בקתות אבן מבודדות עם ג׳קוזי פרטי, מטבחון ומרפסת לתצפית כוכבים.</p><p>בבוקר מגיע לדלת סל ארוחת בוקר עם לחם טרי מהמאפייה של המצפה.</p>",
    ...classify("Bed & Breakfast"),
    accessibilitiesId: ["acc-parking"],
    groupTypesId: ["grp-couples"],
    phoneNumber: "054-6612093",
    busiEmail: "stay@desert-stones.co.il",
    address: { country: "ישראל", city: "מצפה רמון", location: "רחוב הגפן 12" },
    geoLocation: { lat: "30.6100", long: "34.8010" },
    images: img("#1e3a8a", "#c084fc", "✨"),
    createdAt: "2026-08-15T09:00:00.000Z",
  },
  {
    _id: "sample-jeeps",
    name: "ג׳יפים במכתש",
    status: "PENDING",
    shortDescription: "סיורי ג׳יפים מודרכים במכתש רמון, כולל זריחה וסיורי לילה עם טלסקופ.",
    description:
      "<p>סיורי ג׳יפים של שעתיים עד חצי יום, עם מדריכים שגדלו באזור.</p><p>המסלול הפופולרי ביותר יוצא לפני הזריחה ומסתיים בקפה שחור על שפת המכתש.</p>",
    ...classify("Tour Operator"),
    accessibilitiesId: ["acc-parking"],
    groupTypesId: ["grp-family", "grp-groups"],
    phoneNumber: "050-7729134",
    busiEmail: "ride@ramon-jeeps.co.il",
    address: { country: "ישראל", city: "מצפה רמון", location: "שדרות בן גוריון 3" },
    geoLocation: { lat: "30.6120", long: "34.8030" },
    openingHrs: week("05:30", "21:00"),
    images: img("#9a3412", "#fde68a", "🚙"),
    createdAt: "2026-09-01T09:00:00.000Z",
  },
  {
    _id: "sample-cafe",
    name: "קפה שביל הנגב",
    status: "APPROVED",
    shortDescription: "בית קפה למטיילים על שביל ישראל: ארוחות בוקר, מילוי מים ומטען לטלפון.",
    description:
      "<p>תחנת עצירה למטיילים ולרוכבים על שביל ישראל, עם ארוחות בוקר, כריכים ועוגות ביתיות.</p><p>מילוי מים חופשי לכל מי שמגיע ברגל.</p>",
    ...classify("Cafe & Coffee Shop", "Bakery & Pastry"),
    accessibilitiesId: ["acc-parking", "acc-wheel", "acc-wc"],
    groupTypesId: ["grp-family", "grp-groups"],
    phoneNumber: "053-2280471",
    busiEmail: "coffee@negev-trail.co.il",
    address: { country: "ישראל", city: "שדה בוקר", location: "צומת שדה בוקר" },
    geoLocation: { lat: "30.8740", long: "34.7940" },
    openingHrs: week("07:00", "16:00", ["SAT"]),
    images: img("#365314", "#fde047", "☕"),
    createdAt: "2026-09-20T09:00:00.000Z",
  },
  {
    _id: "sample-gallery",
    name: "גלריית חול וזכוכית",
    status: "DRAFT",
    shortDescription: "סטודיו לזכוכית מנופחת מחול המדבר, עם סדנאות קצרות למשפחות.",
    description:
      "<p>סטודיו של אמנית זכוכית שעובדת עם חול מקומי. אפשר לצפות בעבודה ולקנות כלים ותכשיטים.</p><p>סדנאות של שעה לילדים מגיל 8 בתיאום מראש.</p>",
    ...classify("Art Gallery", "Gift & Souvenir Shop"),
    accessibilitiesId: ["acc-wc"],
    groupTypesId: ["grp-family"],
    phoneNumber: "058-9031156",
    busiEmail: "studio@sand-glass.co.il",
    address: { country: "ישראל", city: "מצפה רמון", location: "רובע האמנים, הר ארדון 7" },
    geoLocation: { lat: "30.6150", long: "34.7990" },
    images: img("#0e7490", "#fbcfe8", "🏺"),
    createdAt: "2026-10-05T09:00:00.000Z",
  },
  {
    _id: "sample-spa",
    name: "ספא מעיינות עבדת",
    status: "APPROVED",
    shortDescription: "טיפולי ספא ועיסויים בשמנים מצמחי מדבר, בחדר עם חלון אל הקניון.",
    description:
      "<p>שני חדרי טיפולים עם חלון אל קניון עין עבדת. מציעים עיסוי שוודי, רקמות עמוקות וטיפולי פנים.</p><p>מומלץ להגיע אחרי טיול ולסיים בתה צמחים במרפסת.</p>",
    ...classify("Day Spa", "Massage Therapy"),
    accessibilitiesId: ["acc-parking", "acc-wc"],
    groupTypesId: ["grp-couples"],
    phoneNumber: "052-3378815",
    busiEmail: "relax@avdat-spa.co.il",
    address: { country: "ישראל", city: "מדרשת בן גוריון", location: "מרכז המדרשה" },
    geoLocation: { lat: "30.8500", long: "34.7800" },
    openingHrs: week("09:00", "20:00", ["SAT"]),
    images: img("#134e4a", "#a7f3d0", "🌿"),
    createdAt: "2026-10-28T09:00:00.000Z",
  },
].map((b) => ({
  ...base,
  contactDetails: { name: "יואב לוי", countryCode: "+972", phone: b.phoneNumber, email: b.busiEmail, prefferedChannel: "email" },
  ...b,
}));

/** Onboarding presets: fill every step of the flow in one click. */
export const SAMPLE_DRAFTS: { id: string; label: string; emoji: string; draft: Partial<OnboardingDraft> }[] = [
  {
    id: "olive",
    label: "בית בד ומטעי זיתים",
    emoji: "🫒",
    draft: {
      businessName: "בית הבד של שדה בוקר",
      phone: "052-6650231",
      address: "דרך המטעים 2, שדה בוקר",
      addressParts: { location: "דרך המטעים 2", city: "שדה בוקר", country: "ישראל" },
      geo: { lat: "30.8746", long: "34.7943" },
      categoryGroups: ["Food & Dining", "Travel & Transportation", "Retail & Shopping"],
      subcategories: ["Specialty Grocery & Deli", "Tour Operator", "Gift & Souvenir Shop"],
      customCategories: [],
      mainCategory: "Specialty Grocery & Deli",
      website: "olive-sdeboker.co.il",
      answers: {
        offer: "בית בד משפחתי עם מטע זיתים של 40 דונם. אנחנו מפיקים שמן זית כתית מעולה, עושים סיורים במטע וטעימות שמן עם לחם טאבון.",
        edge: "המטע מושקה במים מליחים מהאקוויפר, מה שנותן לשמן טעם פלפלי ייחודי. אבא שלי שתל את העצים הראשונים לפני 30 שנה ועדיין מדריך בעצמו.",
        fit: "משפחות עם ילדים, קבוצות מטיילים וזוגות שאוהבים אוכל. בעונת המסיק בנובמבר הילדים יכולים לקטוף בעצמם.",
        practical: "פתוח א׳-ו׳ 9:00-16:00. יש חניה גדולה לאוטובוסים, שירותים ושבילים נגישים בחלק מהמטע.",
        reco: "סיור מסיק עם טעימת שמן ולחם חם מהטאבון, הכי שווה בבוקר של נובמבר.",
      },
      products: [
        { name: "סיור מטע וטעימת שמנים", description: "סיור של שעה במטע ובבית הבד, עם טעימת 4 שמנים", price: "65", duration: "60 דקות", bookingRequired: true },
        { name: "סדנת מסיק למשפחות", description: "קטיף זיתים, כבישה וטעימה, בעונת המסיק בלבד", price: "120", duration: "2 שעות", bookingRequired: true },
      ],
    },
  },
  {
    id: "camel",
    label: "חוות גמלים ולינה",
    emoji: "🐪",
    draft: {
      businessName: "חוות הגמלים של מצפה",
      phone: "054-3318842",
      address: "אזור התעשייה 9, מצפה רמון",
      addressParts: { location: "אזור התעשייה 9", city: "מצפה רמון", country: "ישראל" },
      geo: { lat: "30.6100", long: "34.8010" },
      categoryGroups: ["Travel & Transportation", "Hospitality & Lodging"],
      subcategories: ["Tour Operator", "Campground & RV Park"],
      customCategories: [],
      mainCategory: "Tour Operator",
      website: "",
      answers: {
        offer: "רכיבות גמלים של שעה עד יום שלם, לינה באוהל בדואי וארוחת ערב סביב המדורה.",
        edge: "הגמלים גדלו אצלנו מלידה ומכירים כל מדריך. אנחנו היחידים שעושים רכיבת שקיעה אל שפת המכתש.",
        fit: "משפחות עם ילדים מגיל 5, קבוצות בית ספר וחברות שמחפשות גיבוש.",
        practical: "פתוח כל יום. מומלץ להגיע שעה לפני השקיעה. חניה בשטח החווה.",
        reco: "רכיבת השקיעה אל שפת המכתש וארוחה סביב המדורה אחריה.",
      },
      products: [
        { name: "רכיבת שקיעה", description: "רכיבה של שעה וחצי אל שפת המכתש", price: "180", duration: "90 דקות", bookingRequired: true },
        { name: "לינה באוהל בדואי", description: "לינה לזוג כולל ארוחת ערב ובוקר", price: "450", duration: "לילה", bookingRequired: true },
      ],
    },
  },
  {
    id: "bakery",
    label: "מאפייה כפרית",
    emoji: "🥖",
    draft: {
      businessName: "המאפייה של רבקה",
      phone: "050-9127745",
      address: "רחוב הנחל 5, ירוחם",
      addressParts: { location: "רחוב הנחל 5", city: "ירוחם", country: "ישראל" },
      geo: { lat: "30.9870", long: "34.9290" },
      categoryGroups: ["Food & Dining"],
      subcategories: ["Bakery & Pastry", "Cafe & Coffee Shop"],
      customCategories: [],
      mainCategory: "Bakery & Pastry",
      website: "instagram.com/rivkas.bakery",
      answers: {
        offer: "מאפייה קטנה עם לחמי מחמצת, מאפים מרוקאים מסורתיים וקפה. בימי שישי יש סדנת חלות.",
        edge: "כל המתכונים של סבתא שלי ממרקש, והקמח נטחן אצלנו מחיטה שגדלה בנגב.",
        fit: "מטיילים שעוברים בירוחם, משפחות וקבוצות קטנות לסדנאות.",
        practical: "פתוח א׳-ו׳ מ-7:00 עד שנגמר הלחם. נגיש לכיסאות גלגלים.",
        reco: "מופלטה חמה עם דבש ביום שישי בבוקר.",
      },
      products: [
        { name: "סדנת חלות", description: "לישה, קליעה ואפייה, כל משתתף לוקח שתי חלות", price: "140", duration: "2 שעות", bookingRequired: true },
      ],
    },
  },
];
