import { describe, expect, test } from 'bun:test';
import { createPlatformApp } from '../../server/platform/app';
import { unlinkSync } from 'node:fs';

function cleanup(dbPath: string) {
  for (const ext of ['', '-wal', '-shm']) {
    try { unlinkSync(dbPath + ext); } catch { /* ignore */ }
  }
}

async function createSecurityTestContext(testId: string) {
  const testDb = `var/lib/qa/security-${testId}.sqlite`;
  cleanup(testDb);
  const app = createPlatformApp({
    databasePath: testDb,
    bootstrapToken: 'sec-bootstrap-token-99999',
    origin: 'http://localhost:3000',
    allowedOrigins: ['http://localhost:3000', 'https://abangcolek.local'],
  });

  // 1. Bootstrap Founder
  const bootRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      email: `founder-${testId}@test.local`,
      password: 'password123456',
      name: 'Founder User',
      token: 'sec-bootstrap-token-99999',
    }),
  }));
  expect(bootRes.status).toBe(200);
  const bootData = await bootRes.json() as { data: { user: { id: string }; csrfToken: string } };
  const founderCookie = bootRes.headers.get('set-cookie')!;
  const founderCsrf = bootData.data.csrfToken;
  const founderId = bootData.data.user.id;

  // 2. Signup Customer
  const custRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      email: `customer-${testId}@test.local`,
      password: 'password123456',
      name: 'Customer User',
    }),
  }));
  expect(custRes.status).toBe(200);
  const custData = await custRes.json() as { data: { user: { id: string }; csrfToken: string } };
  const customerCookie = custRes.headers.get('set-cookie')!;
  const customerCsrf = custData.data.csrfToken;
  const customerId = custData.data.user.id;

  // 3. Signup Developer
  const devEmail = `dev-${testId}@test.local`;
  const devPass = 'password123456';
  const devRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      email: devEmail,
      password: devPass,
      name: 'Developer User',
    }),
  }));
  expect(devRes.status).toBe(200);
  const devData = await devRes.json() as { data: { user: { id: string }; csrfToken: string } };
  const developerId = devData.data.user.id;

  // Founder grants developer role to Developer User
  const grantRes = await app.fetch(new Request('http://localhost:3000/api/platform/people/grants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000',
      'Cookie': founderCookie,
      'X-CSRF-Token': founderCsrf,
    },
    body: JSON.stringify({
      userId: developerId,
      role: 'developer',
      outletIds: [],
      expectedVersion: 0,
    }),
  }));
  expect(grantRes.status).toBe(200);

  // Developer logs in to get fresh session with developer membership
  const devLoginRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      email: devEmail,
      password: devPass,
    }),
  }));
  expect(devLoginRes.status).toBe(200);
  const devLoginData = await devLoginRes.json() as { data: { user: { id: string }; csrfToken: string } };
  const developerCookie = devLoginRes.headers.get('set-cookie')!;
  const developerCsrf = devLoginData.data.csrfToken;

  return {
    app,
    testDb,
    founder: { id: founderId, cookie: founderCookie, csrf: founderCsrf },
    customer: { id: customerId, cookie: customerCookie, csrf: customerCsrf },
    developer: { id: developerId, cookie: developerCookie, csrf: developerCsrf },
  };
}

describe('C03: Host Security Verification Suite', () => {
  test('Strict Content-Type enforcement on mutating POST endpoints', async () => {
    const ctx = await createSecurityTestContext('content-type');

    // POST with text/plain should be rejected with 415 Unsupported Media Type
    const res = await ctx.app.fetch(new Request('http://localhost:3000/api/platform/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'Origin': 'http://localhost:3000' },
      body: 'plain-text-body',
    }));
    expect(res.status).toBe(415);
    const body = await res.json() as { code: string };
    expect(body.code).toBe('CONTENT_TYPE');

    cleanup(ctx.testDb);
  });

  test('Origin allowlist rejection on unauthorized origins', async () => {
    const ctx = await createSecurityTestContext('origin-allowlist');

    // POST with foreign Origin header should be rejected with 403 Forbidden
    const res = await ctx.app.fetch(new Request('http://localhost:3000/api/platform/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://evil-phishing-site.com' },
      body: JSON.stringify({ email: 'hacker@test.local', password: 'password123', name: 'Hacker' }),
    }));
    expect(res.status).toBe(403);
    const body = await res.json() as { code: string };
    expect(body.code).toBe('ORIGIN_DENIED');

    cleanup(ctx.testDb);
  });

  test('Session cookie security attributes and response security headers', async () => {
    const ctx = await createSecurityTestContext('cookies-headers');

    // Verify session cookie attributes from signup/bootstrap
    expect(ctx.founder.cookie).toContain('HttpOnly');
    expect(ctx.founder.cookie).toContain('SameSite=Strict');
    expect(ctx.founder.cookie).toContain('Path=/api/platform');

    // Verify security headers on responses (no-store, nosniff, no-referrer)
    const res = await ctx.app.fetch(new Request('http://localhost:3000/api/platform/catalogue', {
      method: 'GET',
    }));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');

    cleanup(ctx.testDb);
  });

  test('Negative RBAC: Customer cannot access administrative or founder endpoints', async () => {
    const ctx = await createSecurityTestContext('rbac-customer');

    // Customer trying to access /overview -> 403 FORBIDDEN
    const overviewRes = await ctx.app.fetch(new Request('http://localhost:3000/api/platform/overview', {
      method: 'GET',
      headers: { 'Cookie': ctx.customer.cookie },
    }));
    expect(overviewRes.status).toBe(403);

    // Customer trying to access /people -> 403 FORBIDDEN
    const peopleRes = await ctx.app.fetch(new Request('http://localhost:3000/api/platform/people', {
      method: 'GET',
      headers: { 'Cookie': ctx.customer.cookie },
    }));
    expect(peopleRes.status).toBe(403);

    // Customer trying to access /decisions -> 403 FORBIDDEN
    const decisionsRes = await ctx.app.fetch(new Request('http://localhost:3000/api/platform/decisions', {
      method: 'GET',
      headers: { 'Cookie': ctx.customer.cookie },
    }));
    expect(decisionsRes.status).toBe(403);

    cleanup(ctx.testDb);
  });

  test('Negative RBAC: Developer without founder role cannot access commercial inventory', async () => {
    const ctx = await createSecurityTestContext('rbac-developer');

    // Developer accessing /inventory is blocked with 403 FORBIDDEN
    const invRes = await ctx.app.fetch(new Request('http://localhost:3000/api/platform/inventory', {
      method: 'GET',
      headers: { 'Cookie': ctx.developer.cookie },
    }));
    expect(invRes.status).toBe(403);

    cleanup(ctx.testDb);
  });

  test('Rate limiting / Throttling on rapid requests', async () => {
    const ctx = await createSecurityTestContext('rate-limiting');

    // Store rate bucket test
    expect(() => {
      for (let i = 0; i < 50; i++) {
        ctx.app.store.rate('test-rate-bucket', 20);
      }
    }).toThrow();

    cleanup(ctx.testDb);
  });
});
