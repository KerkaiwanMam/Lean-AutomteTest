import { test as setup, expect } from '@playwright/test';
import { env } from '../src/config/env';

/**
 * Runs once before every other project (see "dependencies" in playwright.config.ts):
 *  - resets ShopLab to the seed data so the run starts from a known state
 *  - turns on BUG MODE when BUG_MODE=1, to prove that the suite catches regressions
 */
setup('reset ShopLab to a known state', async ({ request }) => {
  const health = await request.get('/api/health');
  expect(health.ok(), `ShopLab must be running at ${env.baseURL}`).toBeTruthy();

  const reset = await request.post('/api/test/reset');
  expect(reset.ok()).toBeTruthy();

  const cfg = await request.post('/api/test/config', { data: { bugMode: env.bugMode, latencyMs: 0, failureRate: 0 } });
  expect((await cfg.json()).bugMode).toBe(env.bugMode);
});
