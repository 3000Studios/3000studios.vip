import { defineConfig } from 'playwright/test';

const remote = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: remote || 'http://127.0.0.1:4173', headless: true },
  webServer: remote
    ? undefined
    : {
        command: 'npm run preview -- --host 127.0.0.1 --port 4173',
        port: 4173,
        reuseExistingServer: true,
        timeout: 120000,
      },
});
