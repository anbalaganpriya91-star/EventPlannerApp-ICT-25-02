// dateUtils.js - small helpers for formatting and comparing dates.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n) => String(n).padStart(2, '0');

// "2026-11-05" (used for searching by date)
export function toDateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "5 Nov 2026"
export function formatDate(date) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// "02:30 PM"
export function formatTime(date) {
  const d = new Date(date);
  const hours = d.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${pad(hour12)}:${pad(d.getMinutes())} ${suffix}`;
}

// true if the event's date/time is already over
export function isPast(date) {
  return new Date(date).getTime() < Date.now();
}
