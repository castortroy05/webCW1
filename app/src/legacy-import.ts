import { isRealDate } from './dates.js';
import type { GoalItem } from './db.js';

export interface LegacyGoal {
  name: string;
  started: string;
  completedAt: string | null;
  items: GoalItem[];
}

/**
 * Parses a legacy NeDB datafile (one JSON document per line). NeDB appends updates and
 * `{"$$deleted":true}` tombstones, so the last line for each `_id` wins. Documents that
 * cannot be mapped (no valid dates) are reported in `skipped`.
 */
export function parseLegacyDb(text: string, legacyUser?: string): { goals: LegacyGoal[]; skipped: number } {
  const docs = new Map<string, any>();
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let doc: any;
    try {
      doc = JSON.parse(line);
    } catch {
      continue; // NeDB tolerates a few corrupt lines; so do we
    }
    if (doc?.$$deleted) docs.delete(doc._id);
    else if (doc?._id) docs.set(doc._id, doc);
  }

  const goals: LegacyGoal[] = [];
  let skipped = 0;
  for (const doc of docs.values()) {
    if (legacyUser && doc.user !== legacyUser) continue;
    const items: GoalItem[] = (Array.isArray(doc.goals) ? doc.goals : [])
      .map((g: any) => ({
        exercise: String(g?.exercise ?? '')
          .trim()
          .slice(0, 60),
        activity: String(g?.activity ?? '')
          .trim()
          .slice(0, 120),
        dueDate: String(g?.endDate ?? doc.endDate ?? ''),
      }))
      .filter((i: GoalItem) => i.exercise && i.activity && isRealDate(i.dueDate));
    const started = String(doc.started ?? '');
    if (items.length === 0 || !isRealDate(started)) {
      skipped++;
      continue;
    }
    goals.push({
      name:
        String(doc.exercise ?? items[0]!.exercise)
          .trim()
          .slice(0, 80) || items[0]!.exercise,
      started,
      completedAt: doc.achieved ? (isRealDate(String(doc.endDate)) ? String(doc.endDate) : started) : null,
      items,
    });
  }
  return { goals, skipped };
}
