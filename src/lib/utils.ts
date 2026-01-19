import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


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


export const googlePointOfInterest = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  // {
  //   featureType: 'poi.airport',
  //   elementType: 'labels.text',
  //   stylers: [{ visibility: 'off' }]
  // }
];



