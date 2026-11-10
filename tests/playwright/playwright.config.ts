import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

/**
 * ShopLab reference configuration.
 *
 * Projects
 *   setup  – resets the database once (and enables bug mode when BUG_MODE=1)
 *   api    – fast API/contract tests (no browser)
 *   ui     – browser tests (Chromium by default; set PW_CHANNEL=chrome to use installed Chrome)
 *   visual – screenshot comparison, opt-in (npm run test:visual)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: env.baseURL,
    testIdAttribute: 'data-testid',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'en-US',
    timezoneId: 'Asia/Bangkok',
  },
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    {
      name: 'api',
      testMatch: /tests[\\/]api[\\/].*\.spec\.ts/,
      dependencies: ['setup'],
    },
    {
      name: 'ui',
      testMatch: /tests[\\/](ui|lab|a11y)[\\/].*\.spec\.ts/,
      testIgnore: /admin\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined },
    },
    {
      // Admin tests change SHARED reference data (the product catalogue). Running them after the
      // read-only UI tests keeps "28 products" assertions stable — a test-isolation design decision.
      name: 'ui-admin',
      testMatch: /admin\.spec\.ts/,
      dependencies: ['ui'],
      use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined },
    },
    // Opt-in (VISUAL=1): screenshot baselines are OS/font specific — generate them where CI runs.
    ...(process.env.VISUAL === '1'
      ? [{
          name: 'visual',
          testMatch: /tests[\\/]visual[\\/].*\.spec\.ts/,
          dependencies: ['setup'],
          use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined },
        }]
      : []),
    // Opt-in (EXERCISES=1): course exercises. The learner files are BROKEN ON PURPOSE (flaky tests, refactor kata),
    // so they are never part of the normal run.
    ...(process.env.EXERCISES === '1'
      ? [{
          name: 'exercises',
          testMatch: /tests[\\/]exercises[\\/].*\.spec\.ts/,
          dependencies: ['setup'],
          use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined },
        }]
      : []),
    // Cross-browser: uncomment after `npx playwright install firefox webkit`
    // { name: 'ui-firefox', testMatch: /tests[\\/]ui[\\/].*\.spec\.ts/, dependencies: ['setup'], use: { ...devices['Desktop Firefox'] } },
    // { name: 'ui-mobile', testMatch: /tests[\\/]ui[\\/].*\.spec\.ts/, dependencies: ['setup'], use: { ...devices['Pixel 7'] } },
  ],
  // Starts ShopLab automatically if it is not already running.
  webServer: env.startServer
    ? {
        command: 'npm --prefix ../../practice-app start',
        url: `${env.baseURL}/api/health`,
        reuseExistingServer: true,
        timeout: 60_000,
      }
    : undefined,
});
