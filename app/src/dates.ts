/** YYYY-MM-DD for the given instant, in UTC. */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** True for a real calendar date in YYYY-MM-DD form (rejects e.g. 2026-02-31). */
export function isRealDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && isoDate(d) === s;
}

function isoWeekParts(date: string): { year: number; week: number } {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day); // the Thursday of this week decides the ISO year
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d.getTime() - Date.UTC(year, 0, 1)) / 86_400_000 + 1) / 7);
  return { year, week };
}

/** ISO-8601 week number (1-53) of a YYYY-MM-DD date. */
export function isoWeek(date: string): number {
  return isoWeekParts(date).week;
}

/** Year-qualified ISO week key such as "2026-W12", so weeks from different years never mix. */
export function isoWeekKey(date: string): string {
  const { year, week } = isoWeekParts(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export const WEEK_KEY = /^\d{4}-W\d{2}$/;
