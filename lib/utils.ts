import { menuItems, misc, navbar } from "@/constant/hebrew";
import {
  CtgAttractionIcon,
  CtgCultureIcon,
  CtgEatIcon,
  CtgLocalIcon,
  CtgLodgeIcon,
  CtgTourIcon,
} from "@/components/ui/icons";
import { pathNames } from "./endpoints";
import { CODE } from "@/constant/envConstants";

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  activeIcon: string;
  link: string;
}

export const siteStatus = {
  isNegevTime: CODE === "BNEI" || CODE === "TAV8DL",
  isHofash: CODE === "HOFASH",
};

export const itemTypeEnum = {
  product: "PRODUCT",
  ticket: "TICKET",
};

export const purposeTypeEnum = {
  business: "BUSINESS",
  trip: "TRIP",
  event: "EVENT",
};

export const paymentMethodType = {
  externalLink: "EXTERNAL_LINK",
  ticket: "TICKET",
};

export const imagePlayTypeEnum = {
  manual: "MANUAL",
  automate: "AUTOMATE",
};

export const contactFormReasonOptions = [
  { value: "תווים", label: "תווים" },
  { value: "עסקים", label: "עסקים" },
  { value: "מעסיקים", label: "מעסיקים" },
  { value: "תמיכה טכנית", label: "תמיכה טכנית" },
  { value: "ביטול עסקה", label: "ביטול עסקה" },
];
export const daysMapping = {
  Sun: "ראשון",
  Mon: "שני",
  Tues: "שלישי",
  Wed: "רביעי",
  Thurs: "חמישי",
  Fri: "שישי",
  Sat: "שבת",
};

export const categoryIds = {
  sleep: "6566fcd4a77d2a477266d3b9",
  attraction: "6566e31ca77d2a477266d2d6",
  culture: "6566e36ba77d2a477266d2f4",
  tour: "6566e256a77d2a477266d2c0",
  eat: "6566e3aaa77d2a477266d314",
  local: "6566fd7fa77d2a477266d3ca",
};

const navigationKey = {
  home: pathNames.home,
  events: pathNames.events,
  trails: pathNames.trails,
  businesses: pathNames.businesses,
  blogArticles: pathNames.blogArticles,
};

export const businessMarkers = {
  [categoryIds.eat]: "food.svg",
  [categoryIds.local]: "local.svg",
  [categoryIds.sleep]: "sleep.svg",
  [categoryIds.culture]: "culture.svg",
  [categoryIds.attraction]: "attractions.svg",
  [categoryIds.tour]: "travel.svg",
};

export const stationMarkers = {
  [categoryIds.eat]: "bw-food.svg",
  [categoryIds.local]: "bw-local.svg",
  [categoryIds.sleep]: "bw-sleep.svg",
  [categoryIds.culture]: "bw-culture.svg",
  [categoryIds.attraction]: "bw-attraction.svg",
  [categoryIds.tour]: "bw-travel.svg",
};

export const stationCategory = {
  [categoryIds.eat]: "trail-food.svg",
  [categoryIds.local]: "trail-local.svg",
  [categoryIds.sleep]: "trail-sleep.svg",
  [categoryIds.culture]: "trail-culture.svg",
  [categoryIds.attraction]: "trail-attractions.svg",
  [categoryIds.tour]: "trail-travel.svg",
};

export const categoryGradientClasses = {
  [categoryIds.eat]: "from-ctg-eat-dim via-ctg-eat-light to-ctg-eat-dim",
  [categoryIds.local]:
    "from-ctg-local-dim via-ctg-local-light to-ctg-local-dim",
  [categoryIds.sleep]:
    "from-ctg-lodge-dim via-ctg-lodge-light to-ctg-lodge-dim",
  [categoryIds.culture]:
    "from-ctg-culture-dim via-ctg-culture-light to-ctg-culture-dim",
  [categoryIds.attraction]:
    "from-ctg-attract-dim via-ctg-attract-light to-ctg-attract-dim",
  [categoryIds.tour]: "from-ctg-tour-dim via-ctg-tour-light to-ctg-tour-dim",
};

export const categoryGradinteColor = {
  [categoryIds.eat]: { dim: "#F7BCAC", light: "#F8CBBF" },
  [categoryIds.local]: { dim: "#F9D385", light: "#F9DEA7" },
  [categoryIds.sleep]: { dim: "#90BBE3", light: "#A2C6E6" },
  [categoryIds.culture]: { dim: "#F1A7C9", light: "#F3BDD6" },
  [categoryIds.attraction]: { dim: "#CEA7CE", light: "#D9BCD9" },
  [categoryIds.tour]: { dim: "#64C5C6", light: "#8ED4D5" },
};

export const categoryColors = {
  [categoryIds.eat]: "#f09984",
  [categoryIds.local]: "#ffbe3b",
  [categoryIds.sleep]: "#4c95d8",
  [categoryIds.culture]: "#f174ae",
  [categoryIds.attraction]: "#b571b4",
  [categoryIds.tour]: "#00a5a8",
};

export const categoryBgClasses = {
  [categoryIds.eat]: "bg-ctg-eat-dark",
  [categoryIds.local]: "bg-ctg-local-dark",
  [categoryIds.sleep]: "bg-ctg-lodge-dark",
  [categoryIds.culture]: "bg-ctg-culture-dark",
  [categoryIds.attraction]: "bg-ctg-attract-dark",
  [categoryIds.tour]: "bg-ctg-tour-dark",
};

export const shareKeepNavigate = [
  {
    id: 1,
    label: misc.navigation,
    icon: "navigation",
  },
  // {
  //   id: 2,
  //   label: misc.keeping,
  //   icon: "heart",
  // },
  {
    id: 3,
    label: misc.sharing,
    icon: "share",
  },
];

export const categoryIcons = {
  [categoryIds.tour]: {
    icon: CtgTourIcon,
    bg: "bg-ctg-tour-dark",
  },
  [categoryIds.attraction]: {
    icon: CtgAttractionIcon,
    bg: "bg-ctg-attract-dark",
  },
  [categoryIds.eat]: {
    icon: CtgEatIcon,
    bg: "bg-ctg-eat-dark",
  },
  [categoryIds.culture]: {
    icon: CtgCultureIcon,
    bg: "bg-ctg-culture-dark",
  },
  [categoryIds.sleep]: {
    icon: CtgLodgeIcon,
    bg: "bg-ctg-lodge-dark",
  },
  [categoryIds.local]: {
    icon: CtgLocalIcon,
    bg: "bg-ctg-local-dark",
  },
};

export const features = [
  // {
  //   key: 1,
  //   label: navbar.funDays,
  //   icon: "kite",
  //   activeIcon: "",
  //   link: "",
  // },
  // {
  //   key: 2,
  //   label: navbar.toGroups,
  //   icon: "user-group",
  //   activeIcon: "",
  //   link: "",
  // },
  {
    key: 3,
    label: navbar.events,
    icon: "events",
    activeIcon: "events-dark",
    link: pathNames.events,
  },
  {
    key: 4,
    label: navbar.tracks,
    icon: "trail",
    activeIcon: "trail-dark",
    link: pathNames.trails,
  },
];

export const featureMenus: MenuItem[] = [
  {
    key: "event",
    label: navbar.events,
    icon: "events",
    activeIcon: "events-dark",
    link: pathNames.events,
  },
  {
    key: "trip",
    label: navbar.tracks,
    icon: "trail",
    activeIcon: "trail-dark",
    link: pathNames.trails,
  },
];

export const filterTabs = [
  {
    key: "gallery",
    label: navbar.gallery,
    icon: "dashboard",
  },
  {
    key: "integrated",
    label: navbar.integrated,
    icon: "dashboard-space",
  },
  {
    key: "map",
    label: navbar.map,
    icon: "map-fold",
  },
];

export const navigationPaths = {
  [navigationKey.home]: pathNames.businessDetails,
  [navigationKey.businesses]: pathNames.businessDetails,
  [navigationKey.events]: pathNames.eventDetails,
  [navigationKey.trails]: pathNames.trailDetails,
  [navigationKey.blogArticles]: pathNames.blogArticleDetails,
};

export const navItemsDraft = [
  {
    col1: [
      {
        id: 1,
        label: menuItems.welcome,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        label: menuItems.businessPage,
        href: pathNames.businesses,
        leftIcon: "",
        rightIcon: "",
      },
      // {
      //   id: 3,
      //   label: menuItems.visitorCenter,
      //   href: "#",
      //   leftIcon: "",
      //   rightIcon: "",
      // },
      {
        id: 4,
        label: menuItems.blogArticle,
        href: pathNames.blogArticles,
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 5,
        label: menuItems.joinBusiness,
        href: pathNames.joinBusiness,
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 6,
        label: menuItems.contactUs,
        href: pathNames.contactUs,
        leftIcon: "",
        rightIcon: "",
      },
    ],
    col2: [
      {
        id: 1,
        key: "event",
        label: menuItems.eventGeneralPublic,
        href: pathNames.events,
        leftIcon: "",
        rightIcon: "",
      },
      // {
      //   id: 2,
      //  key: "org",
      //   label: menuItems.eventCompaniesOrg,
      //   href: "#",
      //   leftIcon: "",
      //   rightIcon: "",
      // },
      {
        id: 3,
        key: "trip",
        label: menuItems.routes,
        href: pathNames.trails,
        leftIcon: "",
        rightIcon: "",
      },
    ],
    col3: [
      // {
      //   id: 1,
      //   label: menuItems.mySavedOnes,
      //   href: "#",
      //   leftIcon: "",
      //   rightIcon: "",
      // },
      // {
      //   id: 2,
      //   label: menuItems.checkBalance,
      //   href: "#",
      //   leftIcon: "",
      //   rightIcon: "",
      // },
      // {
      //   id: 3,
      //   label: menuItems.purchasingCharacters,
      //   href: "#",
      //   leftIcon: "",
      //   rightIcon: "",
      // },
      {
        id: 4,
        label: menuItems.shoppingCart,
        href: pathNames.cart,
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 5,
        label: menuItems.exit,
        href: "#",
        leftIcon: "",
        rightIcon: "exit",
      },
    ],
    col4: [
      {
        id: 1,
        label: menuItems.termsConditions,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        label: menuItems.privacyPolicy,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      // {
      //   id: 3,
      //   label: menuItems.hebrew,
      //   href: "#",
      //   rightIcon: "globe",
      //   leftIcon: "down-arrow",
      // },
    ],
  },
];

export const navItems = [
  {
    col1: [
      {
        id: 1,
        key: "",
        label: menuItems.welcome,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        key: "",
        label: menuItems.businessPage,
        href: pathNames.businesses,
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 4,
        key: "",
        label: menuItems.blogArticle,
        href: pathNames.blogArticles,
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 5,
        key: "",
        label: menuItems.joinBusiness,
        href: pathNames.joinBusiness,
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 6,
        key: "",
        label: menuItems.contactUs,
        href: pathNames.contactUs,
        leftIcon: "",
        rightIcon: "",
      },
    ],
    col2: [
      {
        id: 1,
        key: "event",
        label: menuItems.eventGeneralPublic,
        href: pathNames.events,
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 3,
        key: "trip",
        label: menuItems.routes,
        href: pathNames.trails,
        leftIcon: "",
        rightIcon: "",
      },
    ],
    col3: [
      {
        id: 4,
        key: "",
        label: menuItems.shoppingCart,
        href: pathNames.cart,
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 5,
        key: "",
        label: menuItems.exit,
        href: "#",
        leftIcon: "",
        rightIcon: "exit",
      },
    ],
    col4: [
      {
        id: 1,
        key: "",
        label: menuItems.termsConditions,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        key: "",
        label: menuItems.privacyPolicy,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
    ],
  },
];

export const recommendedSearchKeywords = [
  "אירוע קיץ",
  "מסעדה עם נוף",
  "טיול יום",
  "פיקניק",
  "פתוח בשבת",
  "ימי כיף",
];

const weatherIconsMap = {
  [1000]: "sunny",
  [1003]: "cloudy",
  [1006]: "cloudy",
  [1009]: "cloudy",
  [1030]: "sunny",
  [1063]: "sunny",
  [1066]: "sunny",
  [1069]: "sunny",
  [1072]: "sunny",
  [1087]: "thunder",
  [1114]: "thunder",
  [1117]: "thunder",
  [1135]: "cloudy",
  [1147]: "sunny",
  [1150]: "sun-rain",
  [1153]: "sunny",
  [1168]: "sunny",
  [1171]: "sunny",
  [1180]: "light-rain",
  [1183]: "light-rain",
  [1186]: "light-rain",
  [1189]: "light-rain",
  [1192]: "rainy",
  [1198]: "rainy",
  [1201]: "rainy",
  [1204]: "sunny",
  [1207]: "sunny",
  [1210]: "sunny",
  [1213]: "sunny",
  [1216]: "sunny",
  [1219]: "sunny",
  [1222]: "sunny",
  [1225]: "sunny",
  [1237]: "sunny",
  [1240]: "light-rain",
  [1243]: "light-rain",
  [1246]: "light-rain",
  [1249]: "light-rain",
  [1252]: "rainy",
  [1255]: "rainy",
  [1258]: "rainy",
  [1261]: "rainy",
  [1264]: "rainy",
  [1273]: "thunder",
  [1276]: "thunder",
  [1279]: "thunder",
  [1282]: "thunder",
};
export interface WeatherIconsMap {
  [code: number]: string;
}

export const weatherIcons: WeatherIconsMap = weatherIconsMap;

export const devlieryInfoMapData = {
  ["The price covers delivery to all regions nationwide"]:
    "המחיר כולל משלוח לכל חלקי הארץ",
  ["Due to current circumstances, delivery times may experience delays"]:
    "בשל המצב יתכנו עיכובים בזמני המשלוח",
  ["Shipping is not included in the price and will be arranged separately with the business after purchase"]:
    "המחיר לא כולל משלוח. משלוח יוסדר בנפרד למול בית העסק לאחר הרכישה",
  ["Products are available for self-collection from the business location only"]:
    "קבלת המוצר באיסוף עצמי מבית העסק בלבד",
  ["The price does not cover international shipping"]:
    'המחיר לא כולל משלוח לחו"ל',
  ["Sales on the website are subject to the available stock at the listed businesses. The company does not guarantee the availability of all products displayed on the website at all times"]:
    "המכירה דרך האתר הינה בכפוף למלאי הקיים בקרב בתי העסק בו. החברה אינה מתחייבת להחזיק בכל עת מלאי של כל המוצרים שתמונותיהם מופיעות באתר",
  ["Select delivery type"]: "יש לבחור את שיטת המשלוח",
  ["Products cannot be exchanged after purchase"]:
    "לא ניתן להחליף את המוצר לאחר הרכישה",
  ["Products are non-returnable once purchased"]:
    "לא ניתן להחזיר את המוצר לאחר הרכישה",
  ["If the requested product is out of stock, it can be exchanged for another product from the business, with coordination prior to receiving the item"]:
    "ניתן להחליף את המוצר במוצר אחר של בית העסק במידה והמוצר המבוקש לא נמצא במלאי. הדבר יעשה בתיאום למול בית העסק ובטרם קבלת מוצר",
  ["Items from the order can only be returned or exchanged once, in coordination with the business"]:
    "ניתן לבצע החזרה ו/ או החלפה של פריטים מהזמנה פעם אחת בלבד. הדבר יעשה בתיאום בית העסק",
  ["Customers are responsible for returning the product directly to the business"]:
    "באחריות הלקוחות המזמינים לבצע החזרה של המוצר לבית העסק",
  ["Customers are responsible for returning the product to designated collection points prearranged with the business"]:
    "באחריות הלקוחות המזמינים לבצע החזרה של המוצר לנקודות האיסוף שיוסכמו מראש למול בית העסק",
  ["Select return and exchange type"]: "יש לבחור את מדיניות ההחזרות וההחלפות",
};
