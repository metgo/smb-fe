import { pathNames } from "./endpoints";
import { categoryIds, purposeTypeEnum } from "./utils";

// Function to scale layout dimensions based on screen width
export const scaleLayout = (
  layout: LayoutItem[],
  scale: number,
): LayoutItem[] => {
  return layout.map((item) => ({
    width: Math.round(item.width * scale),
    height: Math.round(item.height * scale),
  }));
};

export const handleCropImage = async (
  imageItem: ImageItem,
  aspect: number,
): Promise<{ imageUrl: string; alt: string }> => {
  const encodedImageUrl = encodeURIComponent(imageItem?.image);
  const {
    xMin = 0,
    yMin = 0,
    xMax = 0,
    yMax = 0,
  } = imageItem?.subCoordinates || {};

  if (!xMin && !yMin && !xMax && !yMax) {
    return { imageUrl: imageItem?.image, alt: imageItem?.alt };
  }

  const query = `url=${encodedImageUrl}&xMin=${xMin}&yMin=${yMin}&xMax=${xMax}&yMax=${yMax}&aspect=${aspect}`;
  const res = await fetch(`/api/crop-image?${query}`);

  if (!res.ok) {
    return { imageUrl: imageItem.image, alt: imageItem.alt };
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  return { imageUrl: objectUrl, alt: imageItem.alt };
};

export function shuffleArray<T>(array?: T[] | null): T[] {
  if (!Array.isArray(array) || array?.length === 0) {
    return []; // return empty array safely
  }

  const arr = [...array];

  const random = () => {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] / (0xffffffff + 1);
    }
    return Math.random();
  };

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function getHebrewDateInfo(isoDate: string) {
  const date = new Date(isoDate);

  const hebrewDays = [
    "ראשון", // Sunday
    "שני", // Monday
    "שלישי", // Tuesday
    "רביעי", // Wednesday
    "חמישי", // Thursday
    "שישי", // Friday
    "שבת", // Saturday
  ];

  const hebrewMonths = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];

  return {
    day: date.getDate().toString().padStart(2, "0"),
    days: hebrewDays[date.getDay()],
    month: hebrewMonths[date.getMonth()],
  };
}

export function getUniqueLocations(locations: BusinessMakerProps[]) {
  const uniqueLocations = new Set();
  locations?.forEach((location) => {
    const coords = location?.geoLocation;
    if (!coords) return;

    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.long);

    const key = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
    if (uniqueLocations.has(key)) return;
    uniqueLocations.add(key);
  });
  return uniqueLocations;
}

export function flatStationDetails(station: TrailStationProps) {
  const flatStationInfo = {
    _id: station._id,
    name: station.name,
    description: station.description,
    image: station.images?.[0]?.image,
    geoLocation: station.geoLocation,
    primaryCategoryId: station.primaryCategoryId._id,
    order: station.order,
    type: station.type,
  };

  return flatStationInfo;
}

// export function removeInlineStylesFromHTML(html: string): string {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, "text/html");

//   const elementsWithStyle = doc.querySelectorAll("[style]");
//   elementsWithStyle.forEach((el) => el.removeAttribute("style"));

//   return doc.body.innerHTML;
// }

// export function removeInlineStylesFromHTML(html: string): string {
//   const dom = new JSDOM(html);
//   const doc = dom.window.document;

//   const elementsWithStyle = doc.querySelectorAll("[style]");
//   elementsWithStyle.forEach((el: any) => el.removeAttribute("style"));

//   return doc.body.innerHTML;
// }

export function removeInlineStylesFromHTML(html: string): string {
  if (html) return html?.replace(/\s*style="[^"]*"/gi, "");
  return "";
}

export function getPrimaryCategoryId(
  pathname: string,
  activeCategoryKey: string,
  primaryCategoryId: string,
) {
  if (pathname === pathNames.events) return categoryIds.attraction;
  return activeCategoryKey || primaryCategoryId || "6566e36ba77d2a477266d2f4";
}

export function getPurposeType(pathname: string) {
  if (pathname === pathNames.home || pathname === pathNames.businesses)
    return purposeTypeEnum.business;
  return purposeTypeEnum.trip;
}

type Address = {
  country?: string;
  city?: string;
  location?: string;
  _id?: string;
};

export function getCityOrCenter(
  address: Address | undefined,
): string | undefined {
  if (!address) return undefined;

  // if city has a value, return it
  if (address.city && address.city.trim().length > 0) {
    return address.city;
  }

  // otherwise, try to extract the center part from location
  if (address.location) {
    const parts = address.location.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      return parts[1]; // middle part
    }
    return parts[0]; // fallback if only one part exists
  }

  return undefined;
}

export function getDistanceFromLatLng(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInKm = R * c;

  // return as number rounded to 2 decimal places
  return Number(distanceInKm.toFixed(0));
}

// import mammoth from "mammoth";
// import fs from "fs";
// import path from "path";

// export async function getDocxAsHtml() {
//   const filePath = path.join(process.cwd(), "public/docs/negevtime-privacy-policy.docx");
//   const buffer = fs.readFileSync(filePath);
//   const { value: html } = await mammoth.convertToHtml({ buffer });
//   return html;
// }

/**
 * Ensures <ul> and <ol> elements display proper bullets or numbers.
 * Preserves existing inline styles if present.
 * @param html - Raw HTML string
 * @returns Cleaned and styled HTML string
 */
export function ensureListStyles(html: string = ""): string {
  if (!html) return "";

  // Add proper style for <ul>
  html = html.replace(/<ul(?![^>]*list-style-type)[^>]*>/gi, (match) => {
    // If <ul> already has inline styles
    if (/style\s*=\s*"/i.test(match)) {
      return match.replace(
        /style\s*=\s*"(.*?)"/i,
        (m, p1) =>
          `style="${p1}; list-style-type: disc; margin-right: 2.5rem;"`,
      );
    } else {
      // No style → add one
      return match.replace(
        /<ul/gi,
        '<ul style="list-style-type: disc; margin-right: 2.5rem;"',
      );
    }
  });

  // Add proper style for <ol>
  html = html.replace(/<ol(?![^>]*list-style-type)[^>]*>/gi, (match) => {
    if (/style\s*=\s*"/i.test(match)) {
      return match.replace(
        /style\s*=\s*"(.*?)"/i,
        (m, p1) =>
          `style="${p1}; list-style-type: decimal; margin-right: 2.5rem;"`,
      );
    } else {
      return match.replace(
        /<ol/gi,
        '<ol style="list-style-type: decimal; margin-right: 2.5rem;"',
      );
    }
  });

  return html;
}

export const sanitizeInitialFilters = (
  presets: PresetFilterItems,
  filters: FiltersResponse,
): { sanitized: PresetFilterItems; totalCount: number } => {
  const excludedCategoryId = "6566fd7fa77d2a477266d3ca";

  // const validCategoryIds = new Set(
  //   filters?.categories
  //     .map((c) => c._id)
  //     .filter((id) => id !== excludedCategoryId),
  // );

  const validSubCategoryIds = new Set(
    filters?.subCategories
      .filter((sc) => sc.categoryId !== excludedCategoryId)
      .map((sc) => sc._id),
  );

  const validGroupTypeIds = new Set(filters?.groupTypes.map((gt) => gt._id));
  const validAccessibilityIds = new Set(
    filters?.accessibilities.map((a) => a._id),
  );

  const sanitized = {
    categoryIds: presets?.categoryIds, // removed excluded category
    subCategoryIds: presets?.subCategoryIds.filter((id) =>
      validSubCategoryIds.has(id),
    ),
    groupTypeIds: presets?.groupTypeIds.filter((id) =>
      validGroupTypeIds.has(id),
    ),
    accessibilityIds: presets?.accessibilityIds.filter((id) =>
      validAccessibilityIds.has(id),
    ),
    serviceTypes: presets?.serviceTypes,
  };

  const totalCount =
    sanitized.categoryIds.length +
    sanitized.subCategoryIds.length +
    sanitized.groupTypeIds.length +
    sanitized.accessibilityIds.length +
    sanitized.serviceTypes.length;
  return { sanitized, totalCount };
};
