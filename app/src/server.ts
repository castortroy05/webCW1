import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { GoalStore } from './db.js';
import { createMailer } from './mailer.js';

const config = loadConfig();
const store = new GoalStore(config.DATABASE_PATH);
const app = createApp({ config, store, mailer: createMailer(config) });

const server = app.listen(config.PORT, () => console.log(`Goal Getters listening on :${config.PORT}`));

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => {
      store.close();
      process.exit(0);
    });
  });
}
