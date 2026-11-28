/**
 * Everything that changes between client jobs lives in environment variables (see .env.example),
 * so the test files stay the same for every site.
 */

// Load .env if present (Node 21.7+ built-in, no dotenv dependency). Real environment variables win.
try {
  process.loadEnvFile('.env');
} catch {
  /* no .env file: use real environment variables or the defaults below */
}
const list = (value: string | undefined, fallback: string[] = []): string[] =>
  value === undefined || value.trim() === ''
    ? fallback
    : value.split(',').map((s) => s.trim()).filter(Boolean);

export const targets = {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  smokePaths: list(process.env.SMOKE_PATHS, ['/']),
  loginPath: process.env.LOGIN_PATH || '/login',
  afterLoginPath: process.env.AFTER_LOGIN_PATH || '',
  user: process.env.TEST_USER || '',
  password: process.env.TEST_PASSWORD || '',
  protectedUrls: list(process.env.PROTECTED_URLS),
  forbiddenUrls: list(process.env.FORBIDDEN_URLS),
  ignoreConsole: process.env.IGNORE_CONSOLE ? new RegExp(process.env.IGNORE_CONSOLE, 'i') : undefined,
};

export const isHttps = targets.baseURL.startsWith('https://');
export const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(targets.baseURL);
