import { menuItems, misc, navbar } from "@/constant/hebrew";
import {
  CtgAttractionIcon,
  CtgCultureIcon,
  CtgEatIcon,
  CtgLocalIcon,
  CtgLodgeIcon,
  CtgTourIcon,
} from "@/components/ui/icons";

const categoryId = {
  sleep: "6566fcd4a77d2a477266d3b9",
  attraction: "6566e31ca77d2a477266d2d6",
  culture: "6566e36ba77d2a477266d2f4",
  tour: "6566e256a77d2a477266d2c0",
  eat: "6566e3aaa77d2a477266d314",
  local: "6566fd7fa77d2a477266d3ca",
};

const navigationKey = {
  home: "/",
  events: "/events",
  businesses: "/businesses",
};

export const businessMarkers = {
  [categoryId.eat]: "food.svg",
  [categoryId.local]: "local.svg",
  [categoryId.sleep]: "sleep.svg",
  [categoryId.culture]: "culture.svg",
  [categoryId.attraction]: "attractions.svg",
  [categoryId.tour]: "travel.svg",
};

export const categoryGradientClasses = {
  [categoryId.eat]: "from-ctg-eat-dim via-ctg-eat-light to-ctg-eat-dim",
  [categoryId.local]: "from-ctg-local-dim via-ctg-local-light to-ctg-local-dim",
  [categoryId.sleep]: "from-ctg-lodge-dim via-ctg-lodge-light to-ctg-lodge-dim",
  [categoryId.culture]:
    "from-ctg-culture-dim via-ctg-culture-light to-ctg-culture-dim",
  [categoryId.attraction]:
    "from-ctg-attract-dim via-ctg-attract-light to-ctg-attract-dim",
  [categoryId.tour]: "from-ctg-tour-dim via-ctg-tour-light to-ctg-tour-dim",
};

export const categoryGradinteColor = {
  [categoryId.eat]: { dim: "#F7BCAC", light: "#F8CBBF" },
  [categoryId.local]: { dim: "#F9D385", light: "#F9DEA7" },
  [categoryId.sleep]: { dim: "#90BBE3", light: "#A2C6E6" },
  [categoryId.culture]: { dim: "#F1A7C9", light: "#F3BDD6" },
  [categoryId.attraction]: { dim: "#CEA7CE", light: "#D9BCD9" },
  [categoryId.tour]: { dim: "#64C5C6", light: "#8ED4D5" },
};

export const categoryBgClasses = {
  [categoryId.eat]: "bg-ctg-eat-dark",
  [categoryId.local]: "bg-ctg-local-dark",
  [categoryId.sleep]: "bg-ctg-lodge-dark",
  [categoryId.culture]: "bg-ctg-culture-dark",
  [categoryId.attraction]: "bg-ctg-attract-dark",
  [categoryId.tour]: "bg-ctg-tour-dark",
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
  [categoryId.tour]: {
    icon: CtgTourIcon,
    bg: "bg-ctg-tour-dark",
  },
  [categoryId.attraction]: {
    icon: CtgAttractionIcon,
    bg: "bg-ctg-attract-dark",
  },
  [categoryId.eat]: {
    icon: CtgEatIcon,
    bg: "bg-ctg-eat-dark",
  },
  [categoryId.culture]: {
    icon: CtgCultureIcon,
    bg: "bg-ctg-culture-dark",
  },
  [categoryId.sleep]: {
    icon: CtgLodgeIcon,
    bg: "bg-ctg-lodge-dark",
  },
  [categoryId.local]: {
    icon: CtgLocalIcon,
    bg: "bg-ctg-local-dark",
  },
};

export const features = [
  {
    key: 1,
    label: navbar.funDays,
    icon: "kite",
    activeIcon: "",
    link: "",
  },
  {
    key: 2,
    label: navbar.toGroups,
    icon: "user-group",
    activeIcon: "",
    link: "",
  },
  {
    key: 3,
    label: navbar.events,
    icon: "events",
    activeIcon: "events-dark",
    link: "/events",
  },
  {
    key: 4,
    label: navbar.tracks,
    icon: "trail",
    activeIcon: "trail-dark",
    link: "/trails",
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
  [navigationKey.home]: "/business-details",
  [navigationKey.businesses]: "/business-details",
  [navigationKey.events]: "/event-details",
};

export const navItems = [
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
        href: "/businesses",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 3,
        label: menuItems.visitorCenter,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 4,
        label: menuItems.blogArticle,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 5,
        label: menuItems.joinBusiness,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 6,
        label: menuItems.contactUs,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
    ],
    col2: [
      {
        id: 1,
        label: menuItems.eventGeneralPublic,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        label: menuItems.eventCompaniesOrg,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 3,
        label: menuItems.routes,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
    ],
    col3: [
      {
        id: 1,
        label: menuItems.mySavedOnes,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 2,
        label: menuItems.checkBalance,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 3,
        label: menuItems.purchasingCharacters,
        href: "#",
        leftIcon: "",
        rightIcon: "",
      },
      {
        id: 4,
        label: menuItems.shoppingCart,
        href: "#",
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
      {
        id: 3,
        label: menuItems.hebrew,
        href: "#",
        rightIcon: "globe",
        leftIcon: "down-arrow",
      },
    ],
  },
];
