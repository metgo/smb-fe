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
  return new Date(dateStr).toLocaleDateString(
    language === "ar" ? "ar-EG" : language === "he" ? "he-IL" : "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );
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
