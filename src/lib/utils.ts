import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { routes } from "./routes";
import { UserRole } from "@/enums/user.types";
import { User, ShieldCheck, Map, Building2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const locales: { value: Language; label: string; flag?: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "he", label: "עברית", flag: "🇮🇱" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
];

export const getLogoByLanguage = (language: Language): string => {
  switch (language) {
    case "he":
    case "ar":
      return "/assets/images/nati-logo-he.png";
    default:
      return "/assets/images/nati-logo-en.png";
  }
};

export const TICKET_TYPE_STYLES: Record<string, string> = {
  free: "bg-green-500/20 text-green-600 dark:text-green-400",
  vip: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  donation: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  paid: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

export const itemStatuses = [
  { value: "DRAFT", label: "draft" },
  { value: "PENDING", label: "pending" },
  { value: "ARCHIVED", label: "archived" },
  { value: "APPROVED", label: "approved" },
  { value: "CLOSED", label: "closed" },
  { value: "REJECTED", label: "rejected" },
];

export const categoryIds = {
  sleep: "6566fcd4a77d2a477266d3b9",
  attraction: "6566e31ca77d2a477266d2d6",
  culture: "6566e36ba77d2a477266d2f4",
  tour: "6566e256a77d2a477266d2c0",
  eat: "6566e3aaa77d2a477266d314",
  local: "6566fd7fa77d2a477266d3ca",
  event: "6566e208a77d2a477266d2b3",
};

export const categories: Record<string, string> = {
  [categoryIds.eat]: "eat",
  [categoryIds.local]: "local",
  [categoryIds.sleep]: "sleep",
  [categoryIds.culture]: "culture",
  [categoryIds.attraction]: "attraction",
  [categoryIds.tour]: "travel",
};

export const itemEndpoint: Record<string, string> = {
  BUSINESS: routes.businessDetails,
  POI: routes.poiDetails,
  PRODUCT: routes.productDetails,
  EVENT: routes.eventDetails,
  DISPUTE: routes.vendorReconciliationMgmt,
};

export const googlePointOfInterest = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.business",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.attraction",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.place_of_worship",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  // {
  //   featureType: 'poi.airport',
  //   elementType: 'labels.text',
  //   stylers: [{ visibility: 'off' }]
  // }
];

export const DELIVERY_RETURN_EXCHANGE_OPTIONS = [
  "return_option1",
  "return_option2",
  "return_option3",
  "return_option4",
  "return_option5",
  "return_option6",
  "return_option7",
  "return_option8",
];
export const DELIVERY_SPECIFIC_SELLER_INFO_OPTIONS = [
  "seller_info_option1",
  "seller_info_option2",
  "seller_info_option3",
  "seller_info_option4",
  "seller_info_option5",
  "seller_info_option6",
  "seller_info_option7",
  "seller_info_option8",
  "seller_info_option9",
];

export const ROLE_TABS = [
  { id: UserRole.SUPERADMIN, label: "Super Admins", icon: ShieldCheck },
  { id: UserRole.DMO, label: "DMOs", icon: Map },
  { id: UserRole.AUTHORITY, label: "Authorities", icon: Building2 },
  { id: UserRole.TRAVELLER, label: "Travellers", icon: User },
];

export const EMAIL_TEMPLATE_IMAGE_KEYS = [
  { _id: "FOOTER1", name: "FOOTER1" },
  { _id: "FOOTER2", name: "FOOTER2" },
  { _id: "FOOTER3", name: "FOOTER3" },
  { _id: "FOOTER4", name: "FOOTER4" },
  { _id: "FOOTER5", name: "FOOTER5" },
  { _id: "FOOTER_BADGE", name: "FOOTER_BADGE" },
  { _id: "FOOTER_BANNER", name: "FOOTER_BANNER" },
  { _id: "FOOTER_BANNER_MOBILE", name: "FOOTER_BANNER_MOBILE" },
  { _id: "BANNER_IMG", name: "BANNER_IMG" },
  { _id: "MOBILE_BANNER_IMG", name: "MOBILE_BANNER_IMG" },
  {
    _id: "FOOTER_BANNER_MINISITE_BANNER",
    name: "FOOTER_BANNER_MINISITE_BANNER",
  },
];

// ==================================== Item list table columns ========================================
// ------------ 1. Businesses -----------------
export const BUSINESS_COLUMNS = {
  COLUMNS_STORAGE_KEY: "businessesTableColumns",
  defaultColumns: {
    impact: true,
    name: true,
    shortDescription: true,
    contactDetails: true,
    busiEmail: true,
    phoneNumber: true,
    productCount: true,
    status: true,
    associatedWebsites: false,
    contactPhone: false,
    categories: false,
  },
  columnDefinitions: [
    { key: "impact", isDefault: true },
    { key: "name", isDefault: true },
    { key: "shortDescription", isDefault: true },
    { key: "contactDetails", isDefault: true },
    { key: "busiEmail", isDefault: true },
    { key: "phoneNumber", isDefault: true },
    { key: "productCount", isDefault: true },
    { key: "status", isDefault: true },
    { key: "associatedWebsites", isDefault: false },
    { key: "contactPhone", isDefault: false },
    { key: "categories", isDefault: false },
  ] as Array<{
    key: keyof IBusinessColumnVisibility;
    isDefault: boolean;
  }>,
};

// ------------ 2. Products -----------------
export const PRODUCT_COLUMNS = {
  COLUMNS_STORAGE_KEY: "productsTableColumns",
  defaultColumns: {
    images: true,
    name: true,
    businessId: true,
    shortDescription: false,
    description: false,
    actions: true,
    status: true,
    price: true,
    impact: false,
    quantity: true,
    updatedAt: true,
    createdAt: true,
  },
  columnDefinitions: [
    { key: "images", isDefault: true },
    { key: "name", isDefault: true },
    { key: "businessId", isDefault: true },
    { key: "status", isDefault: true },
    { key: "price", isDefault: true },
    { key: "actions", isDefault: true },
    { key: "quantity", isDefault: true },
    { key: "updatedAt", isDefault: true },
    { key: "createdAt", isDefault: true },
    { key: "impact", isDefault: false },
    { key: "description", isDefault: false },
    { key: "shortDescription", isDefault: false },
  ] as Array<{
    key: keyof IProductColumnVisibility;
    isDefault: boolean;
  }>,
};

// ------------ 3. Events -----------------
export const EVENT_COLUMNS = {
  COLUMNS_STORAGE_KEY: "eventsTableColumns",
  defaultColumns: {
    image: true,
    name: true,
    status: true,
    dayDescription: true,
    ticketCount: true,
    wrapperCount: false,
    associatedWebsiteIds: false,
    address: false,
    pricing: true,
    hasExternalTicket: false,
    ticketBuyLink: false,
    updatedAt: true,
    createdAt: true,
  },
  columnDefinitions: [
    { key: "image", isDefault: true },
    { key: "name", isDefault: true },
    { key: "status", isDefault: true },
    { key: "dayDescription", isDefault: true },
    { key: "ticketCount", isDefault: true },
    { key: "wrapperCount", isDefault: false },
    { key: "associatedWebsiteIds", isDefault: false },
    { key: "address", isDefault: false },
    { key: "pricing", isDefault: true },
    { key: "hasExternalTicket", isDefault: false },
    { key: "ticketBuyLink", isDefault: false },
    { key: "updatedAt", isDefault: true },
    { key: "createdAt", isDefault: true },
  ] as Array<{
    key: keyof IEventColumnVisibility;
    isDefault: boolean;
  }>,
};

// ------------ 4. Trips -----------------
export const TRIP_COLUMNS = {
  COLUMNS_STORAGE_KEY: "tripsTableColumns",
  defaultColumns: {
    name: true,
    shortDescription: true,
    estimatedDuration: true,
    stations: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  },
  columnDefinitions: [
    { key: "name", isDefault: true },
    { key: "shortDescription", isDefault: true },
    { key: "estimatedDuration", isDefault: true },
    { key: "stations", isDefault: true },
    { key: "status", isDefault: true },
    { key: "createdAt", isDefault: true },
    { key: "updatedAt", isDefault: true },
  ] as Array<{
    key: keyof ITripColumnVisibility;
    isDefault: boolean;
  }>,
};

// ------------ 5. POIs -----------------
export const POI_COLUMNS = {
  COLUMNS_STORAGE_KEY: "poisTableColumns",
  defaultColumns: {
    impact: true,
    name: true,
    shortDescription: true,
    address: true,
    status: true,
  },
  columnDefinitions: [
    { key: "impact", isDefault: true },
    { key: "name", isDefault: true },
    { key: "shortDescription", isDefault: true },
    { key: "address", isDefault: true },
    { key: "status", isDefault: true },
  ] as Array<{
    key: keyof IPoiColumnVisibility;
    isDefault: boolean;
  }>,
};

// ------------ 6. Orders -----------------
export const ORDER_COLUMNS = {
  COLUMNS_STORAGE_KEY: "ordersTableColumns",
  defaultColumns: {
    name: true,
    email: true,
    phone: true,
    status: true,
    paymentStatus: true,
    paymentMethod: false,
    totalOrderAmount: true,
    productCount: true,
    deliveryFee: true,
    createdAt: true,
    _id: false,
    website: true,
    dmos: true,
    authorities: true,
  },
  columnDefinitions: [
    { key: "name", isDefault: true },
    { key: "email", isDefault: true },
    { key: "phone", isDefault: true },
    { key: "status", isDefault: true },
    { key: "paymentStatus", isDefault: true },
    { key: "paymentMethod", isDefault: false },
    { key: "totalOrderAmount", isDefault: true },
    { key: "productCount", isDefault: true },
    { key: "deliveryFee", isDefault: true },
    { key: "createdAt", isDefault: true },
    { key: "_id", isDefault: false },
    { key: "website", isDefault: true },
    { key: "dmos", isDefault: true },
    { key: "authorities", isDefault: true },
  ] as Array<{
    key: keyof IOrderColumnVisibility;
    isDefault: boolean;
  }>,
};

// ------------ 7. Order Summary -----------------
export const ORDER_SUMMARY_COLUMNS = {
  COLUMNS_STORAGE_KEY: "orderSummaryTableColumns",
  defaultColumns: {
    businessName: true,
    businessAddressCity: true,
    businessAddressLocation: true,
    totalNoOfOrders: true,
    totalAmount: true,
    totalAmountPaidByCreditCard: true,
  },
  columnDefinitions: [
    { key: "businessName", isDefault: true },
    { key: "businessAddressCity", isDefault: true },
    { key: "businessAddressLocation", isDefault: true },
    { key: "totalNoOfOrders", isDefault: true },
    { key: "totalAmount", isDefault: true },
    { key: "totalAmountPaidByCreditCard", isDefault: true },
  ] as Array<{
    key: keyof IOrderSummaryColumnVisibility;
    isDefault: boolean;
  }>,
};

// Google Analytics - Data Studio Report URLs
export const websitesAnalyticsReport = [
  {
    _id: "665ea1ebb543b9e55f3bff71",
    name: "תו 8",
    purpose: "MARKETPLACE",
    websiteUrl: "https://tav-8.co.il",
    logo: "https://storage.googleapis.com/tav8-sderot20w3s71w1n/logo/company.svg",
    gaDataStudioId: "bf4a74b7-2461-4171-aac6-e65649f69839",
  },
  {
    _id: "689aca6896fc4dd7086c8834",
    name: "הנגב הפורח",
    purpose: "TRAVELING",
    websiteUrl: "https://negevtime.co.il",
    logo: "https://storage.googleapis.com/bnei-fo5gz43xdb6i5t/images/logo/black.svg",
    gaDataStudioId: "15c71d0b-29ee-4d8c-9ba1-0764bc22de35",
  },
  {
    _id: "69fc87cc2add117312a6bfb5",
    name: "K8 Market",
    purpose: "MARKETPLACE",
    websiteUrl: "https://k8market.com/",
    logo: "https://storage.googleapis.com/metgo_dev/2026/4/8wx5Es79rjcabFFf.png",
    gaDataStudioId: "5abde87d-1cb2-4c34-9fa2-f1ca21b4d3fb",
  },
  {
    _id: "69d4ac45a21dc4e01d306c86",
    name: "מטבע הארי",
    purpose: "MARKETPLACE",
    websiteUrl: "https://visitgalil.co.il",
    logo: "https://storage.googleapis.com/galil-u123ho7fgfosd/emails/header/company-logo.png",
    gaDataStudioId: "9ec61bfa-9966-4c8b-aec8-3183867cc196",
  },
  {
    _id: "68cbeaae68573c3ff74ab1ff",
    name: "חוף אשקלון",
    websiteUrl: "https://hofash.co.il/",
    logo: "https://storage.googleapis.com/hofash-ft5gz4td6b68g9/images/logo/black.svg",
    purpose: "TRAVELING",
    gaDataStudioId: "e74a2919-8469-4390-9382-0820c54676a0",
  },
  {
    _id: "6927d45f50add3723628b4d9",
    name: "הקצה",
    websiteUrl: "https://hakatze.co.il",
    logo: "https://storage.googleapis.com/hakatze-v-ho7fgf-os/images/logo/white.svg",
    purpose: "TRAVELING",
    gaDataStudioId: "65a1522c-2155-41ef-ac62-e7f691184be2",
  },
  {
    _id: "69a15fcdffe2526563bfb907",
    name: "כיף בעוטף",
    websiteUrl: "https://kefotef.co.il/",
    logo: "https://storage.googleapis.com/metgo_dev/2026/5/krLY9C4fAfNJPXIm.webp",
    purpose: "TRAVELING",
    gaDataStudioId: "6db428ee-a5a7-4c88-97d3-ed9d9a4387cc",
  },
  {
    _id: "69e217df883f154071b49de1",
    name: "גלבוע, מעל הכל",
    websiteUrl: "https://theviewpoint.co.il/",
    logo: "https://storage.googleapis.com/metgo_dev/2026/3/0K6DKWUcFce1sj1x.png",
    purpose: "TRAVELING",
    gaDataStudioId: "f9c7c64b-eb20-4ca2-ac7b-9a85eb904506",
  },
  {
    _id: "69fc595e2add117312a6bfad",
    name: "במעלה",
    websiteUrl: "https://bamaale.co.il/",
    logo: "https://storage.googleapis.com/metgo_dev/2026/4/XTesy3Nj4FnUVTx1.png",
    purpose: "TRAVELING",
    gaDataStudioId: "8b58352c-cc5a-40d5-befb-a37b7687c7ab",
  },

  {
    _id: "67ff852373b8abc8aeb7bd80",
    name: "תו הנגב",
    purpose: "MARKETPLACE",
    websiteUrl: "https://tavhanegev.co.il",
    logo: "https://storage.googleapis.com/metgo_dev/2026/5/ceRAmdRbBO6DcbUE.svg",
    gaDataStudioId: "",
  },
  {
    _id: "696cb7a40ae797cedc4d013b",
    name: "קסם המדבר",
    websiteUrl: "",
    logo: "https://storage.googleapis.com/metgo_dev/2026/5/INTNEHNqjGqx6HSu.png",
    purpose: "TRAVELING",
    gaDataStudioId: "",
  },
];
