import { describe, expect, test } from 'bun:test';
import { createPlatformApp } from '../../server/platform/app';
import { unlinkSync } from 'node:fs';

const testDb = 'var/lib/qa/developer-workspaces-test.sqlite';

function cleanup() {
  for (const ext of ['', '-wal', '-shm']) {
    try { unlinkSync(testDb + ext); } catch { /* ignore */ }
  }
}

describe('D03: Distinct Scoped Developer Reports and Settings', () => {
  test('developer can access telemetry and health without financial escalation', async () => {
    cleanup();
    const app = createPlatformApp({ databasePath: testDb, bootstrapToken: 'dev-ws-bootstrap-token' });

    // Bootstrap founder
    const bootRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({ email: 'founder@devtest.local', password: 'password123456', name: 'Founder DevTest', token: 'dev-ws-bootstrap-token' }),
    }));
    expect(bootRes.status).toBe(200);
    const bootData = await bootRes.json() as { data: { user: { id: string }, csrfToken: string }, cookie: string };
    const founderCookie = bootRes.headers.get('set-cookie')!;
    const founderCsrf = bootData.data.csrfToken;

    // Create a developer user
    const devSignupRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({ email: 'developer@devtest.local', password: 'password123456', name: 'Dev User' }),
    }));
    expect(devSignupRes.status).toBe(200);
    const devSignupData = await devSignupRes.json() as { data: { user: { id: string } } };

    // Grant developer role
    const grantRes = await app.fetch(new Request('http://localhost:3000/api/platform/people/grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000', 'Cookie': founderCookie, 'x-csrf-token': founderCsrf },
      body: JSON.stringify({ userId: devSignupData.data.user.id, role: 'developer', outletIds: ['hq'], expectedVersion: 0 }),
    }));
    expect(grantRes.status).toBe(200);

    // Login as developer
    const devLoginRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({ email: 'developer@devtest.local', password: 'password123456' }),
    }));
    expect(devLoginRes.status).toBe(200);
    const devCookie = devLoginRes.headers.get('set-cookie')!;
    const devLoginData = await devLoginRes.json() as { data: { csrfToken: string } };
    const devCsrf = devLoginData.data.csrfToken;

    // Developer Reports data sources:
    // 1. /health
    const healthRes = await app.fetch(new Request('http://localhost:3000/api/platform/health', {
      headers: { 'Cookie': devCookie },
    }));
    expect(healthRes.status).toBe(200);
    const healthList = await healthRes.json() as { ok: boolean, data: { component: string, status: string, reasonCode: string }[] };
    expect(healthList.ok).toBe(true);
    expect(healthList.data.some(c => c.component === 'platform_database' && c.status === 'ready')).toBe(true);
    // Verified no secret/token leak in health response
    expect(JSON.stringify(healthList).includes('token')).toBe(false);

    // 2. /jobs
    const jobsRes = await app.fetch(new Request('http://localhost:3000/api/platform/jobs', {
      headers: { 'Cookie': devCookie },
    }));
    expect(jobsRes.status).toBe(200);
    const jobsList = await jobsRes.json() as { ok: boolean, data: unknown[] };
    expect(jobsList.ok).toBe(true);
    expect(Array.isArray(jobsList.data)).toBe(true);

    // Developer Settings data sources:
    // 1. /runtime-controls GET
    const rcGetRes = await app.fetch(new Request('http://localhost:3000/api/platform/runtime-controls', {
      headers: { 'Cookie': devCookie },
    }));
    expect(rcGetRes.status).toBe(200);
    const rcData = await rcGetRes.json() as { ok: boolean, data: { activeRelease: string, workerAdmission: string, version: number } };
    expect(rcData.ok).toBe(true);
    expect(rcData.data.activeRelease).toBe('platform-local-v1');

    // 2. /runtime-controls POST (developer can safely toggle worker admission)
    const rcPostRes = await app.fetch(new Request('http://localhost:3000/api/platform/runtime-controls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000', 'Cookie': devCookie, 'x-csrf-token': devCsrf },
      body: JSON.stringify({ workerAdmission: 'paused', expectedVersion: rcData.data.version }),
    }));
    expect(rcPostRes.status).toBe(200);
    const rcPostData = await rcPostRes.json() as { ok: boolean, data: { workerAdmission: string, version: number } };
    expect(rcPostData.data.workerAdmission).toBe('paused');

    // Restore worker admission
    await app.fetch(new Request('http://localhost:3000/api/platform/runtime-controls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000', 'Cookie': devCookie, 'x-csrf-token': devCsrf },
      body: JSON.stringify({ workerAdmission: 'active', expectedVersion: rcPostData.data.version }),
    }));

    // Negative security tests: Developer cannot access founder financial / business reports
    const founderReports = await app.fetch(new Request('http://localhost:3000/api/platform/reports/definitions', {
      headers: { 'Cookie': devCookie },
    }));
    expect(founderReports.status).toBe(403);

    const founderFinance = await app.fetch(new Request('http://localhost:3000/api/platform/finance/summary', {
      headers: { 'Cookie': devCookie },
    }));
    expect(founderFinance.status).toBe(403);

    const founderOverview = await app.fetch(new Request('http://localhost:3000/api/platform/overview', {
      headers: { 'Cookie': devCookie },
    }));
    expect(founderOverview.status).toBe(403);

    cleanup();
  });
});
