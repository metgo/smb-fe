export function normalizePhone(num?: string | null): string | null {
  if (!num) return num;
  const normalized = num.replace(/^0+/, '');
  return normalized.length ? normalized : null;
}
