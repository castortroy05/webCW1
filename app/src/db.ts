import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { isoDate, isoWeek, isoWeekKey } from './dates.js';

export type Status = 'active' | 'overdue' | 'complete';

export interface GoalItem {
  exercise: string;
  activity: string;
  dueDate: string;
}

export interface Goal {
  id: number;
  name: string;
  started: string;
  endDate: string;
  week: number;
  /** Year-qualified ISO week, e.g. "2026-W12". */
  weekKey: string;
  status: Status;
  items: GoalItem[];
}

export interface GoalInput {
  name: string;
  items: GoalItem[];
}

export interface Counts {
  active: number;
  overdue: number;
  complete: number;
}

export interface ListFilter {
  status?: Status;
  /** Year-qualified ISO week key, e.g. "2026-W12". */
  week?: string;
}

const SCHEMA = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS goals (
    id           INTEGER PRIMARY KEY,
    user_id      TEXT NOT NULL,
    name         TEXT NOT NULL,
    started      TEXT NOT NULL,
    completed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS goals_user ON goals (user_id);
  CREATE TABLE IF NOT EXISTS goal_items (
    id       INTEGER PRIMARY KEY,
    goal_id  INTEGER NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    exercise TEXT NOT NULL,
    activity TEXT NOT NULL,
    due_date TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS goal_items_goal ON goal_items (goal_id);
`;

interface GoalRow {
  id: number;
  name: string;
  started: string;
  completed_at: string | null;
}
interface ItemRow {
  goal_id: number;
  exercise: string;
  activity: string;
  due_date: string;
}

/**
 * Goal storage. Every method takes the owning user's id and scopes its query
 * to it, so one user can never read or change another user's goals.
 * Status (active/overdue/complete) is derived from dates, never stored.
 */
export class GoalStore {
  readonly db: Database.Database;

  constructor(
    path: string,
    private readonly now: () => Date = () => new Date(),
  ) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA);
  }

  close(): void {
    this.db.close();
  }

  private hydrate(rows: GoalRow[]): Goal[] {
    if (rows.length === 0) return [];
    const today = isoDate(this.now());
    const marks = rows.map(() => '?').join(',');
    const items = this.db
      .prepare(
        `SELECT goal_id, exercise, activity, due_date FROM goal_items
         WHERE goal_id IN (${marks}) ORDER BY goal_id, position`,
      )
      .all(...rows.map((r) => r.id)) as ItemRow[];
    const byGoal = new Map<number, ItemRow[]>();
    for (const i of items) {
      const list = byGoal.get(i.goal_id);
      if (list) list.push(i);
      else byGoal.set(i.goal_id, [i]);
    }
    return rows.map((r) => {
      const mine = byGoal.get(r.id) ?? [];
      const endDate = mine.reduce((max, i) => (i.due_date > max ? i.due_date : max), '');
      const status: Status = r.completed_at ? 'complete' : endDate < today ? 'overdue' : 'active';
      return {
        id: r.id,
        name: r.name,
        started: r.started,
        endDate,
        week: isoWeek(endDate),
        weekKey: isoWeekKey(endDate),
        status,
        items: mine.map((i) => ({ exercise: i.exercise, activity: i.activity, dueDate: i.due_date })),
      };
    });
  }

  list(userId: string, filter: ListFilter = {}): Goal[] {
    const rows = this.db
      .prepare('SELECT id, name, started, completed_at FROM goals WHERE user_id = ?')
      .all(userId) as GoalRow[];
    return this.hydrate(rows)
      .filter((g) => (filter.status ? g.status === filter.status : true))
      .filter((g) => (filter.week ? g.weekKey === filter.week : true))
      .sort((a, b) => a.endDate.localeCompare(b.endDate) || a.id - b.id);
  }

  counts(userId: string): Counts {
    const counts: Counts = { active: 0, overdue: 0, complete: 0 };
    for (const g of this.list(userId)) counts[g.status]++;
    return counts;
  }

  get(userId: string, id: number): Goal | undefined {
    const row = this.db
      .prepare('SELECT id, name, started, completed_at FROM goals WHERE id = ? AND user_id = ?')
      .get(id, userId) as GoalRow | undefined;
    return row ? this.hydrate([row])[0] : undefined;
  }

  create(userId: string, input: GoalInput): number {
    const insert = this.db.transaction(() => {
      const { lastInsertRowid } = this.db
        .prepare('INSERT INTO goals (user_id, name, started) VALUES (?, ?, ?)')
        .run(userId, input.name, isoDate(this.now()));
      this.replaceItems(Number(lastInsertRowid), input.items);
      return Number(lastInsertRowid);
    });
    return insert();
  }

  /** Edits are only allowed while a goal is still active. */
  update(userId: string, id: number, input: GoalInput): boolean {
    const existing = this.get(userId, id);
    if (!existing || existing.status !== 'active') return false;
    this.db.transaction(() => {
      this.db.prepare('UPDATE goals SET name = ? WHERE id = ?').run(input.name, id);
      this.replaceItems(id, input.items);
    })();
    return true;
  }

  complete(userId: string, id: number): boolean {
    const r = this.db
      .prepare('UPDATE goals SET completed_at = ? WHERE id = ? AND user_id = ? AND completed_at IS NULL')
      .run(isoDate(this.now()), id, userId);
    return r.changes > 0;
  }

  delete(userId: string, id: number): boolean {
    return this.db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, userId).changes > 0;
  }

  private replaceItems(goalId: number, items: GoalItem[]): void {
    this.db.prepare('DELETE FROM goal_items WHERE goal_id = ?').run(goalId);
    const insert = this.db.prepare(
      'INSERT INTO goal_items (goal_id, position, exercise, activity, due_date) VALUES (?, ?, ?, ?, ?)',
    );
    items.forEach((i, pos) => insert.run(goalId, pos, i.exercise, i.activity, i.dueDate));
  }
}
