import { defineConfig } from '@playwright/test';

const PORT = 8123;

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  workers: 1, // one shared in-memory database
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Lets a pre-installed Chromium be used where `playwright install` is unavailable.
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH, args: ['--no-sandbox'] }
      : {},
  },
  webServer: {
    command: 'npx tsx src/demo.ts',
    url: `http://localhost:${PORT}/healthz`,
    env: { PORT: String(PORT), DATABASE_PATH: ':memory:', LOG_LEVEL: 'warn' },
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
