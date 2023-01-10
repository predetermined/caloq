export const DAY = 1000 * 60 * 60 * 24;

export function getCurrentDateWithOffset(offset: number) {
  return new Date(new Date().getTime() + offset);
}

export function getDateAtHour0(date: Date) {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}
