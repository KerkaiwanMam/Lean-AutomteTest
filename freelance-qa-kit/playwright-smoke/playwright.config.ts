import { defineConfig, devices } from '@playwright/test';
import { targets } from './src/targets';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retries are for DETECTING flaky results (reported as "flaky"), not for hiding them.
  retries: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: targets.baseURL,
    // Evidence for the findings report (template 07)
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'th-TH',
    timezoneId: 'Asia/Bangkok',
  },
  projects: [
    // PW_CHANNEL=chrome uses the installed Google Chrome instead of Playwright's bundled Chromium
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], channel: process.env.PW_CHANNEL || undefined } },
    // Thai users are mostly on phones; WebKit approximates iPhone Safari (run `npx playwright install webkit` once)
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      testMatch: /(smoke|responsive|critical-flow).*\.spec\.ts/,
    },
  ],
});
