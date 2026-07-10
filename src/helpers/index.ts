import { formatDateRange } from "@/helpers/formatter";

export function uploadWithProgress(
  file: File,
  signedUrl: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", signedUrl);

    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));

    xhr.send(file);
  });
}
export function detectLanguage(text: string): Language {
  if (!text || typeof text !== "string") return "en";

  const sample = text.trim().slice(0, 500);

  const patterns: Record<any, RegExp> = {
    he: /[\u0590-\u05FF]/, // Hebrew
    ar: /[\u0600-\u06FF]/, // Arabic
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(sample)) {
      return lang as Language;
    }
  }

  return "en"; // default for Latin scripts
}

export const convertToWebP = async (file: File): Promise<File> => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);

  const blob = await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b!), "image/webp", 0.8),
  );

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
  });
};

export function extractCenterAddressText(address: string): string | null {
  // Split by spaces
  const parts = address ? address?.split(" ") : "-";

  // Find the part that is not a plus-code (e.g., "5H8P+WJ") and not a comma
  for (const part of parts) {
    const trimmed = part.replace(",", ""); // remove comma if any
    if (!trimmed.includes("+") && trimmed.length > 0) {
      return trimmed;
    }
  }

  return null;
}
export const formatOrderDate = (dateString: string, language?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function extractEventDates(
  dayDescription?: { date: string | Date }[],
): string {
  if (!dayDescription || dayDescription.length === 0) return "-";

  const dates = dayDescription
    .map((d) => (d?.date instanceof Date ? d.date : new Date(d?.date)))
    .filter(Boolean)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 1) {
    const str = dates[0].toISOString();
    return formatDateRange(str, str, false);
  }

  const startStr = dates[0].toISOString();
  const endStr = dates[dates.length - 1].toISOString();

  return formatDateRange(startStr, endStr, true);
}

export const parseAddress = (address: any) => {
  const parts = address.split(",");

  return {
    location: parts[0]?.trim(), // David HaMelech St 35
    city: parts[1]?.trim(), // Be'er Sheva
    country: parts[2]?.trim(), // Israel
  };
};

export function getPlainTextFromRichText(html: string): string {
  if (!html) return "";

  const temp = document.createElement("div");
  temp.innerHTML = html;

  return temp.textContent?.trim() || "";
}

export function getMatchedItems(originalList: any, selectedIds?: string[]) {
  if (!originalList?.length || !selectedIds?.length) return [];

  const matchedItems = originalList?.filter((item: any) =>
    selectedIds?.includes(item._id),
  );
  return matchedItems ?? [];
}

export function removeNulls(arr: string[]) {
  return arr?.filter((item) => item !== null);
}

export const modelTitle = (mode: TOpMode, t: (key: string) => string) => {
  switch (mode) {
    case "CREATE":
      return t("create");
    case "EDIT":
      return t("edit");
    case "DUPLICATE":
      return t("duplicate");
    default:
      return "";
  }
};

//vouchers
export const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status: IVoucher["status"]) => {
  switch (status) {
    case "ACTIVE":
      return "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50";
    case "ASSIGNED":
      return "bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50";
    case "UNASSIGNED":
      return "bg-gray-200 text-gray-900 border border-gray-400 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700/50";
    case "REDEEMED":
      return "bg-green-100 text-green-900 border border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50";
    case "EXPIRED":
      return "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50";
    case "CANCELED":
      return "bg-red-100 text-red-900 border border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50";
    default:
      return "bg-gray-200 text-gray-900 border border-gray-400 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700/50";
  }
};
export const getStatusLabel = (status: IVoucher["status"]) => {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    ASSIGNED: "Assigned",
    REDEEMED: "Redeemed",
    EXPIRED: "Expired",
    CANCELED: "Cancelled",
    UNASSIGNED: "Unassigned",
  };
  return labels[status];
};

//notification helpers

export const getBorderColor = (type: TNotifType, isRTL: boolean) => {
  switch (type) {
    case "INFO":
      return isRTL ? "border-r-blue-500" : "border-l-blue-500";
    case "ACTION":
      return isRTL ? "border-r-amber-500" : "border-l-amber-500";
    case "WARNING":
      return isRTL ? "border-r-yellow-500" : "border-l-yellow-500";
    case "ERROR":
      return isRTL ? "border-r-red-500" : "border-l-red-500";
  }
};

export const timeAgo = (timestamp: string | number | Date) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diff < 60) return "Just now";

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
};

export function getLngWiseStr(
  lng: Language,
  en?: string,
  he?: string,
  ar?: string,
) {
  switch (lng) {
    case "he":
      return he || en || ar || "-";

    case "ar":
      return ar || en || he || "-";

    case "en":
    default:
      return en || he || ar || "-";
  }
}

export function compareValues(
  a: any,
  b: any,
  direction: "asc" | "desc",
): number {
  if (a == null && b == null) return 0;
  if (a == null) return direction === "asc" ? 1 : -1;
  if (b == null) return direction === "asc" ? -1 : 1;

  const aDate =
    typeof a === "string" || typeof a === "number" ? new Date(a) : null;
  const bDate =
    typeof b === "string" || typeof b === "number" ? new Date(b) : null;

  if (aDate && bDate && !isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
    return direction === "asc"
      ? aDate.getTime() - bDate.getTime()
      : bDate.getTime() - aDate.getTime();
  }
  if (typeof a === "string" && typeof b === "string") {
    return direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);
  }
  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }
  if (typeof a === "boolean" && typeof b === "boolean") {
    return direction === "asc"
      ? a === b
        ? 0
        : a
          ? 1
          : -1
      : a === b
        ? 0
        : a
          ? -1
          : 1;
  }
  if (a < b) return direction === "asc" ? -1 : 1;
  if (a > b) return direction === "asc" ? 1 : -1;
  return 0;
}

export const isExpiringSoon = (date: string) => {
  const daysUntilExpiry = Math.ceil(
    (new Date(date).getTime() - Date.now()) / (700 * 60 * 60 * 24),
  );
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
};

export const isExpired = (date: string) => {
  return new Date(date) < new Date();
};

export const AVATAR_COLORS = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-indigo-500",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function formatLastLogin(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
