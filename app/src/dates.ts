/** YYYY-MM-DD for the given instant, in UTC. */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** ISO-8601 week number (1-53) of a YYYY-MM-DD date. */
export function isoWeek(date: string): number {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day); // nearest Thursday decides the year
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
}
