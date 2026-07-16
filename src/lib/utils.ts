import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { routes } from "./routes";
import { UserRole } from "@/enums/user.types";
import { User, Shield, ShieldCheck, Map, Building2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const locales: { value: Language; label: string; flag?: string }[] = [
  { value: "en", label: "English", flag: "/assets/images/gb.png" },
  { value: "he", label: "עברית", flag: "/assets/images/il.png" },
  { value: "ar", label: "العربية", flag: "/assets/images/sa.png" },
];

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
  { id: UserRole.ADMIN, label: "Admins", icon: Shield },
  { id: UserRole.DMO, label: "DMOs", icon: Map },
  { id: UserRole.AUTHORITY, label: "Authorities", icon: Building2 },
  { id: UserRole.TRAVELLER, label: "Travellers", icon: User },
];
