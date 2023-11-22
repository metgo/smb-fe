export function twoYearExpireDate(currentDate: Date): Date {
  const newDate = new Date(currentDate);
  newDate.setFullYear(currentDate.getFullYear() + 2);
  return newDate;
}
