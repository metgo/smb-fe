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

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  // Use crypto.getRandomValues if available, otherwise fall back to Math.random
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

export function removeInlineStylesFromHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const elementsWithStyle = doc.querySelectorAll("[style]");
  elementsWithStyle.forEach((el) => el.removeAttribute("style"));

  return doc.body.innerHTML;
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
