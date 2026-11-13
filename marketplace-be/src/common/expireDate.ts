export function twoYearExpireDate(): Date {
  const newDate = new Date();
  newDate.setFullYear(newDate.getFullYear() + 2);
  return newDate;
}

export function oneHrsExpireDate(): Date {
  const newDate = new Date();
  const newTimestamp = new Date(newDate.getTime() + 60 * 60 * 1000);
  return newTimestamp;
}

export function checkExpireDate(previousDate: Date): boolean {
  return new Date() < previousDate;
}
