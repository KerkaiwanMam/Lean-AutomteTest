import { test, expect } from '@playwright/test';
import { targets, isHttps, isLocal } from '../src/targets';

/**
 * PASSIVE security basics (checklist 02 D). Only reads what the site already sends to every visitor.
 * Run it only with the client's written permission (intake form part D). This is not a penetration test.
 */

/** Patterns for secrets that must never reach a browser. Publishable keys (Stripe pk_, Supabase anon, Firebase AIza…) are public by design. */
const SECRET_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'Stripe secret/restricted key', re: /\b(sk|rk)_live_[0-9a-zA-Z]{20,}/g },
  { name: 'AWS access key ID', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'Private key block', re: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
  { name: 'OpenAI API key', re: /\bsk-(proj-)?[A-Za-z0-9_-]{32,}/g },
  { name: 'Anthropic API key', re: /\bsk-ant-[A-Za-z0-9_-]{20,}/g },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g },
  { name: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/g },
];

const JWT = /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

/** A Supabase service_role JWT bypasses Row Level Security — critical if it is in client code. */
function serviceRoleJwts(text: string): string[] {
  const hits: string[] = [];
  for (const token of text.match(JWT) ?? []) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
      if (payload.role === 'service_role') hits.push(token);
    } catch {
      /* not a JWT we can read */
    }
  }
  return hits;
}

const mask = (s: string) => `${s.slice(0, 8)}…${s.slice(-4)} (${s.length} chars)`;

test('client-side JavaScript contains no secrets', async ({ page }) => {
  const sources = new Map<string, string>();
  page.on('response', async (res) => {
    if (res.request().resourceType() !== 'script') return;
    try {
      sources.set(res.url(), await res.text());
    } catch {
      /* body not available (redirect/aborted) */
    }
  });

  for (const path of targets.smokePaths) {
    await page.goto(path);
    await page.waitForLoadState('networkidle').catch(() => {});
    sources.set(`${path} (inline HTML)`, await page.content());
  }

  const findings: string[] = [];
  for (const [url, body] of sources) {
    for (const { name, re } of SECRET_PATTERNS) {
      for (const hit of body.match(re) ?? []) findings.push(`${name}: ${mask(hit)} in ${url}`);
    }
    for (const hit of serviceRoleJwts(body)) findings.push(`Supabase service_role key: ${mask(hit)} in ${url}`);
  }

  test.info().annotations.push({ type: 'scanned', description: `${sources.size} script/HTML sources` });
  // Values are masked so the report itself does not leak the secret
  expect(findings, 'secrets exposed to the browser — report as Critical and ask the client to ROTATE the key').toEqual([]);
});

test('security headers and cookie flags (report only)', async ({ page, context }) => {
  const response = await page.goto(targets.smokePaths[0]);
  const headers = response!.headers();

  const checks: [string, boolean][] = [
    ['Content-Security-Policy', 'content-security-policy' in headers],
    ['X-Content-Type-Options: nosniff', headers['x-content-type-options']?.toLowerCase() === 'nosniff'],
    [
      'Clickjacking protection (frame-ancestors or X-Frame-Options)',
      /frame-ancestors/i.test(headers['content-security-policy'] ?? '') || 'x-frame-options' in headers,
    ],
    ['Referrer-Policy', 'referrer-policy' in headers],
  ];
  if (isHttps) checks.push(['Strict-Transport-Security', 'strict-transport-security' in headers]);

  const cookies = (await context.cookies()).map((c) => ({
    name: c.name,
    secure: c.secure,
    httpOnly: c.httpOnly,
    sameSite: c.sameSite,
  }));

  const missing = checks.filter(([, ok]) => !ok).map(([name]) => name);
  for (const name of missing) test.info().annotations.push({ type: 'missing header', description: name });
  for (const c of cookies.filter((c) => (isHttps && !c.secure) || !c.httpOnly)) {
    test.info().annotations.push({
      type: 'cookie flag',
      description: `${c.name}: Secure=${c.secure} HttpOnly=${c.httpOnly} SameSite=${c.sameSite} (fine for non-session cookies)`,
    });
  }
  await test.info().attach('headers-and-cookies.json', {
    body: JSON.stringify({ headers, missing, cookies }, null, 2),
    contentType: 'application/json',
  });
  // Report-only: missing headers are usually Medium/Low findings, judged in context — this test does not fail on them.
});

test('HTTP redirects to HTTPS', async ({ request }) => {
  test.skip(!isHttps || isLocal, 'only meaningful for a public https:// site');
  const httpUrl = targets.baseURL.replace(/^https:/, 'http:');
  const res = await request.get(httpUrl, { maxRedirects: 0 }).catch(() => null);
  test.skip(res === null, 'port 80 not reachable — nothing is served over plain HTTP');
  expect(res!.status(), 'plain HTTP should redirect').toBeGreaterThanOrEqual(300);
  expect(res!.status()).toBeLessThan(400);
  expect(res!.headers()['location'] ?? '').toMatch(/^https:/);
});

test('error pages do not leak stack traces', async ({ request }) => {
  const res = await request.get(`/this-page-should-not-exist-${Date.now()}`);
  const body = await res.text();
  expect(res.status(), 'unknown URL').toBeGreaterThanOrEqual(400);
  expect(body, 'stack trace / framework internals in error page').not.toMatch(
    /at [\w.<>]+ \(.*:\d+:\d+\)|Traceback \(most recent call last\)|SQLSTATE|node_modules[\\/]/,
  );
});
