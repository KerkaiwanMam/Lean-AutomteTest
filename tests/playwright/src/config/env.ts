/**
 * Single place for environment-specific values. Never hard-code URLs or credentials in tests.
 * Override with environment variables (or a CI secret store) per environment: local / dev / staging.
 */
export const env = {
  baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
  /** start ShopLab via Playwright's webServer when it is not running (local dev convenience) */
  startServer: process.env.START_SERVER !== '0',
  bugMode: process.env.BUG_MODE === '1',
  users: {
    // Seeded practice accounts (see practice-app/src/seed-data.js). Real projects: read from a secret store.
    customer: { username: process.env.CUSTOMER_USER ?? 'customer', password: process.env.CUSTOMER_PASS ?? 'Passw0rd!' },
    jane: { username: 'jane', password: process.env.CUSTOMER_PASS ?? 'Passw0rd!' },
    admin: { username: process.env.ADMIN_USER ?? 'admin', password: process.env.ADMIN_PASS ?? 'Admin123!' },
    locked: { username: 'locked', password: 'Passw0rd!' },
  },
} as const;

export type Credentials = { username: string; password: string };
