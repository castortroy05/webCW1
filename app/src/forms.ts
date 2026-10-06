import { z } from 'zod';
import type { GoalInput } from './db.js';

const MAX_ITEMS = 3;
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date');

const item = z.object({
  exercise: z.string().trim().min(1, 'Exercise is required').max(60),
  activity: z.string().trim().min(1, 'Details are required').max(120),
  dueDate: date.catch(''),
});

export interface FormValues {
  name: string;
  items: { exercise: string; activity: string; dueDate: string }[];
}

export type Parsed = { ok: true; input: GoalInput } | { ok: false; errors: string[]; values: FormValues };

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Parse the goal form (fields: name, items[n][exercise|activity|dueDate]). Blank rows are ignored. */
export function parseGoalForm(body: unknown): Parsed {
  const b = (body ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(b.items) ? b.items : [];
  const rows = Array.from({ length: MAX_ITEMS }, (_, i) => {
    const r = (rawItems[i] ?? {}) as Record<string, unknown>;
    return { exercise: text(r.exercise), activity: text(r.activity), dueDate: text(r.dueDate) };
  });
  const values: FormValues = { name: text(b.name), items: rows };
  const filled = rows.filter((r) => r.exercise || r.activity || r.dueDate);

  const errors: string[] = [];
  if (values.name.length > 80) errors.push('Goal name must be 80 characters or fewer');
  if (filled.length === 0) errors.push('Add at least one exercise');
  filled.forEach((r, i) => {
    const res = item.safeParse(r);
    if (!res.success) errors.push(`Exercise ${i + 1}: ${res.error.issues.map((x) => x.message).join(', ')}`);
    else if (!res.data.dueDate) errors.push(`Exercise ${i + 1}: a valid due date is required`);
  });
  if (errors.length) return { ok: false, errors, values };

  const first = filled[0]!;
  return { ok: true, input: { name: values.name || first.exercise, items: filled } };
}

export const shareForm = z.object({
  recipient: z.email('Enter a valid email address'),
  message: z.string().trim().max(500).optional(),
});
