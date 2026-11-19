/** Fechas en hora local con formato ISO yyyy-mm-dd y textos en español (México). */

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Los últimos `n` días terminando en `endIso` (incluido), del más antiguo al más reciente. */
export function lastNDays(endIso: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(endIso, i - (n - 1)));
}

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const WEEKDAY_LETTER = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Miércoles 18 de noviembre" */
export function formatLongDate(iso: string): string {
  const d = fromISODate(iso);
  return `${capitalize(WEEKDAYS[d.getDay()])} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

/** "Noviembre 2026" */
export function formatMonthYear(iso: string): string {
  const d = fromISODate(iso);
  return `${capitalize(MONTHS[d.getMonth()])} ${d.getFullYear()}`;
}

/** "12 – 18 de noviembre" (o con ambos meses si cambian). */
export function formatRange(startIso: string, endIso: string): string {
  const a = fromISODate(startIso);
  const b = fromISODate(endIso);
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} de ${MONTHS[b.getMonth()]}`;
  return `${a.getDate()} ${MONTHS_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]}`;
}

/** "18 nov" */
export function formatShortDate(iso: string): string {
  const d = fromISODate(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** Inicial del día de la semana: L M X J V S D. */
export function weekdayLetter(iso: string): string {
  return WEEKDAY_LETTER[fromISODate(iso).getDay()];
}

/** "Jueves 12" */
export function formatWeekdayDay(iso: string): string {
  const d = fromISODate(iso);
  return `${capitalize(WEEKDAYS[d.getDay()])} ${d.getDate()}`;
}

export function dayOfMonth(iso: string): number {
  return fromISODate(iso).getDate();
}

/** "08:10" a partir de un ISO completo. */
export function formatTime(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Formato de número con separador de miles: 2050 → "2,050". */
export function formatNumber(n: number): string {
  const rounded = Math.round(n);
  const text = Math.abs(rounded).toLocaleString('en-US');
  return rounded < 0 ? `−${text}` : text;
}

/** Signo matemático real (−) para números negativos. */
export function formatSigned(n: number): string {
  const rounded = Math.round(n);
  if (rounded === 0) return '0';
  return (rounded > 0 ? '+' : '−') + formatNumber(Math.abs(rounded));
}
