const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(isoDate: string) {
  const { weekday, dayMonth } = formatDateParts(isoDate);
  return `${weekday} ${dayMonth}`;
}

export function formatDateParts(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return {
    weekday: WEEKDAYS[date.getUTCDay()],
    dayMonth: `${day} ${MONTHS[month - 1]}`,
  };
}

export function shiftISODate(isoDate: string, offsetDays: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + offsetDays);

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isToday(isoDate: string) {
  return isoDate === todayISO();
}

export function monthRange(year: number, month: number) {
  const m = String(month).padStart(2, "0");
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${year}-${m}-01`,
    end: `${year}-${m}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function formatMonthYear(year: number, month: number) {
  return `${MONTHS[month - 1]} ${year}`;
}

export function parseYearMonth(value: string): { year: number; month: number } {
  const [y, m] = value.split("-").map(Number);
  return { year: y, month: m };
}

export function currentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function shiftMonth(year: number, month: number, offset: number) {
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function formatShortDate(isoDate: string) {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS[month - 1].slice(0, 3)}`;
}
