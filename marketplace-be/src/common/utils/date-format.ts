function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function formatDateHumanReadable(date: Date): string {
  const day = date.getDate();
  return date
    .toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^\d+/, `${day}${ordinalSuffix(day)}`);
}
