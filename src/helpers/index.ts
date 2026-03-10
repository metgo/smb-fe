import { formatDateRange } from "@/helpers/formatter";
import type { Notification } from "@/types/notifications";
import { Info, AlertCircle, AlertTriangle, XCircle } from "lucide-react";

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

//notification helpers

export const getBorderColor = (
  type: Notification["item"]["notifType"],
  isRTL: boolean,
) => {
  switch (type) {
    case "INFO":
      return isRTL ? "border-r-blue-500" : "border-l-blue-500";
    case "ACTION":
      return isRTL ? "border-r-purple-500" : "border-l-purple-500";
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
