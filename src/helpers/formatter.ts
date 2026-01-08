export const formatDateRange = (start: string, end: string, isMultiDay: boolean) => {
  if (!isMultiDay) {
    return new Date(start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  const startFormatted = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFormatted = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startFormatted} – ${endFormatted}`;
};

export function normalizePhone(phone: string): string {
  return phone.replace(/^0+/, '');
}

export function normalizeTime(durationInSec: number): string {
  if (durationInSec <= 0) return '0sec';

  const hr = Math.floor(durationInSec / 3600);
  const min = Math.floor((durationInSec % 3600) / 60);
  const sec = Math.floor(durationInSec % 60);

  const parts: string[] = [];

  if (hr > 0) parts.push(`${hr}hr`);
  if (min > 0) parts.push(`${min}min`);
  if (sec > 0 || parts.length === 0) parts.push(`${sec}sec`);

  return parts.join(' ');
}
