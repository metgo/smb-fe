const monthNames: Record<string, string[]> = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  he: [
    "ינו",
    "פבר",
    "מרץ",
    "אפר",
    "מאי",
    "יונ",
    "יול",
    "אוג",
    "ספט",
    "אוק",
    "נוב",
    "דצמ",
  ],
  ar: [
    "ينا",
    "فبر",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ],
};

export const formatDateRange = (
  start: string,
  end: string,
  isMultiDay: boolean,
) => {
  if (!isMultiDay) {
    return new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const startFormatted = new Date(start).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endFormatted = new Date(end).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startFormatted} – ${endFormatted}`;
};

export function normalizePhone(phone: string): string {
  return phone.replace(/^0+/, "");
}

export function normalizeTime(durationInSec: number): string {
  if (durationInSec <= 0) return "0sec";

  const hr = Math.floor(durationInSec / 3600);
  const min = Math.floor((durationInSec % 3600) / 60);
  const sec = Math.floor(durationInSec % 60);

  const parts: string[] = [];

  if (hr > 0) parts.push(`${hr}hr`);
  if (min > 0) parts.push(`${min}min`);
  if (sec > 0 || parts.length === 0) parts.push(`${sec}sec`);

  return parts.join(" ");
}

export const formatDate = (dateStr: string, language: string) => {
  const d = new Date(dateStr);

  // Use UTC values to ignore timezone shift
  const day = d.getUTCDate();
  const month = d.getUTCMonth(); // 0-based
  const year = d.getUTCFullYear();

  const lang = language === "ar" ? "ar" : language === "he" ? "he" : "en";

  return `${day} ${monthNames[lang][month]} ${year}`;
};

export const formatDateTime = (dateStr: string, language: string) => {
  const d = new Date(dateStr);

  // Always use UTC to avoid timezone shift
  const day = d.getUTCDate();
  const month = d.getUTCMonth(); // 0-based
  const year = d.getUTCFullYear();
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const seconds = d.getUTCSeconds();

  const lang = language === "ar" ? "ar" : language === "he" ? "he" : "en";

  // Pad time values (04 instead of 4)
  const pad = (num: number) => num.toString().padStart(2, "0");

  return `${day} ${monthNames[lang][month]} ${year} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export function formatToBackendTemplate(html: string) {
  return html.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, variable) => {
    // Convert to uppercase and replace spaces with underscore
    const formatted = variable.trim().toUpperCase().replace(/\s+/g, "_");
    return `*|${formatted}|*`;
  });
}

export function formatFromBackendTemplate(html: string) {
  return html.replace(/\*\|\s*([^|]+)\s*\|\*/g, (_, variable) => {
    // Convert FIRST_NAME → First Name
    const formatted = variable
      .toLowerCase()
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return `{{ ${formatted} }}`;
  });
}

export function formatILSDraft(amount: string | number): string {
  const value = Number(amount);

  if (Number.isNaN(value)) return "₪0.00";

  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatILS(amount: string | number): string {
  const value = Number(amount);

  if (Number.isNaN(value)) return "₪0.00";

  const scales = [
    { threshold: 1_000_000_000_000, suffix: "T" },
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];

  for (const { threshold, suffix } of scales) {
    if (value >= threshold) {
      return `₪${(value / threshold).toFixed(2)}${suffix}`;
    }
  }

  return `₪${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
