import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { devAuth } from './dev-auth.js';
import { GoalStore } from './db.js';
import { createMailer } from './mailer.js';

const config = loadConfig();
if (config.DEV_AUTH && process.env.NODE_ENV === 'production') throw new Error('DEV_AUTH must not be used in production');
if (config.DEV_AUTH) console.warn('\n*** DEMO MODE: login is disabled, everyone is "Demo User". Not for production. ***\n');
const store = new GoalStore(config.DATABASE_PATH);
const app = createApp({ config, store, mailer: createMailer(config), ...(config.DEV_AUTH ? { authMiddleware: devAuth } : {}) });

const server = app.listen(config.PORT, () => console.log(`Goal Getters listening on :${config.PORT}`));

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => {
      store.close();
      process.exit(0);
    });
  });
}
