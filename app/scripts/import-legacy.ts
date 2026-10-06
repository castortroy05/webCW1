// Usage: npm run import-legacy -- <newgoals.db> <auth0-user-id> [legacy-username]
// Example: npm run import-legacy -- ../newgoals.db "auth0|abc123" antony.lockhart
import { readFileSync } from 'node:fs';
import { GoalStore } from '../src/db.js';
import { parseLegacyDb } from '../src/legacy-import.js';

const [file, userId, legacyUser] = process.argv.slice(2);
if (!file || !userId) {
  console.error('Usage: npm run import-legacy -- <newgoals.db> <auth0-user-id> [legacy-username]');
  process.exit(1);
}

const { goals, skipped } = parseLegacyDb(readFileSync(file, 'utf8'), legacyUser);
const store = new GoalStore(process.env.DATABASE_PATH ?? 'data/goalgetters.db');
for (const g of goals) store.importGoal(userId, g);
store.close();
console.log(`Imported ${goals.length} goals for ${userId}${skipped ? ` (${skipped} skipped: no usable dates)` : ''}.`);
