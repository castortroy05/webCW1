// Zero-config local demo: `npm run demo` (no Auth0 or SMTP needed).
if (process.env.NODE_ENV === 'production') throw new Error('Demo mode must not run in production');
process.env.DEV_AUTH = 'true';
process.env.DATABASE_PATH ??= 'data/demo.db';
await import('./server.js');
