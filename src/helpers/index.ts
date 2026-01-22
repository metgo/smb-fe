import { formatDateRange } from '@/helpers/formatter';

export function uploadWithProgress(
  file: File,
  signedUrl: string,
  onProgress: (percent: number) => void
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


export function extractCenterAddressText(address: string): string | null {
  // Split by spaces
  const parts = address?  address?.split(" "): "-";

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
  dayDescription?: { date: string | Date }[]
): string {
  if (!dayDescription || dayDescription.length === 0) return '-';

  const formattedDates = dayDescription
    .map(d => {
      // Convert Date object to ISO string if needed
      const dateStr = d?.date instanceof Date ? d.date.toISOString() : d?.date;
      return formatDateRange(dateStr, dateStr, false);
    })
    .filter(Boolean);

  return formattedDates.length > 0 ? formattedDates.join(', ') : '-';
}

