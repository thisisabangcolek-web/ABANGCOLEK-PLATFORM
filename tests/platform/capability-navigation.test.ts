import { describe, expect, test } from 'bun:test';
import { canAccessSection, getNavigation, getNavigationGroups, resolveRoute, sectionCapabilities } from '../../src/features/platform/routes';
import { createPlatformApp } from '../../server/platform/app';
import { PlatformStore } from '../../server/platform/store';
import { unlinkSync } from 'node:fs';

const testDb = 'var/lib/qa/capability-nav-test.sqlite';

function cleanup() {
  for (const ext of ['', '-wal', '-shm']) {
    try { unlinkSync(testDb + ext); } catch { /* ignore */ }
  }
}

describe('D02: Capability-aware navigation metadata and access control', () => {
  test('navigation items have explicit domain capabilities, not generic workspace.role', () => {
    const founderNav = getNavigation('founder');
    expect(founderNav.find(i => i.id === 'finance')?.requiredCapability).toBe('business.read');
    expect(founderNav.find(i => i.id === 'people')?.requiredCapability).toBe('people.grant');
    expect(founderNav.find(i => i.id === 'settings')?.requiredCapability).toBe('business.write');
    expect(founderNav.find(i => i.id === 'overview')?.requiredCapability).toBe('business.read');

    const staffNav = getNavigation('staff');
    expect(staffNav.every(i => i.requiredCapability === 'assigned.read')).toBe(true);

    const devNav = getNavigation('developer');
    expect(devNav.every(i => i.requiredCapability === 'runtime.read')).toBe(true);

    const customerNav = getNavigation('customer');
    expect(customerNav.every(i => i.requiredCapability === 'own.read')).toBe(true);
  });

  test('canAccessSection validates actor capabilities correctly', () => {
    // Founder with full business capabilities
    const founderCaps = ['business.read', 'business.write', 'people.grant', 'payment.confirm'];
    expect(canAccessSection('founder', 'overview', founderCaps)).toBe(true);
    expect(canAccessSection('founder', 'finance', founderCaps)).toBe(true);
    expect(canAccessSection('founder', 'people', founderCaps)).toBe(true);
    expect(canAccessSection('founder', 'settings', founderCaps)).toBe(true);

    // Founder missing people.grant cannot access people section
    const restrictedFounder = ['business.read'];
    expect(canAccessSection('founder', 'finance', restrictedFounder)).toBe(true);
    expect(canAccessSection('founder', 'people', restrictedFounder)).toBe(false);
    expect(canAccessSection('founder', 'settings', restrictedFounder)).toBe(false);

    // Developer cannot access founder finance or settings
    const devCaps = ['runtime.read'];
    expect(canAccessSection('developer', 'reports', devCaps)).toBe(true);
    expect(canAccessSection('developer', 'settings', devCaps)).toBe(true);
    expect(canAccessSection('developer', 'overview', devCaps)).toBe(true);
    expect(canAccessSection('founder', 'finance', devCaps)).toBe(false);

    // Customer cannot access staff or developer sections
    const custCaps = ['own.read', 'own.write'];
    expect(canAccessSection('customer', 'orders', custCaps)).toBe(true);
    expect(canAccessSection('staff', 'tasks', custCaps)).toBe(false);
    expect(canAccessSection('developer', 'jobs', custCaps)).toBe(false);
  });

  test('backend enforces strict capability denial without leaking records', async () => {
    cleanup();
    const app = createPlatformApp({ databasePath: testDb, bootstrapToken: 'test-bootstrap-token-12345' });

    // Bootstrap founder
    const bootRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({ email: 'founder@test.local', password: 'password123456', name: 'Founder Test', token: 'test-bootstrap-token-12345' }),
    }));
    expect(bootRes.status).toBe(200);
    const bootData = await bootRes.json() as { data: { user: { id: string }, csrfToken: string }, cookie: string };
    const founderCookie = bootRes.headers.get('set-cookie')!;
    const founderCsrf = bootData.data.csrfToken;

    // Create a customer user
    const custRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({ email: 'customer@test.local', password: 'password123456', name: 'Customer Test' }),
    }));
    expect(custRes.status).toBe(200);
    const custData = await custRes.json() as { data: { user: { id: string }, csrfToken: string } };
    const custCookie = custRes.headers.get('set-cookie')!;

    // Grant developer membership to customer user
    const grantRes = await app.fetch(new Request('http://localhost:3000/api/platform/people/grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000', 'Cookie': founderCookie, 'x-csrf-token': founderCsrf },
      body: JSON.stringify({ userId: custData.data.user.id, role: 'developer', outletIds: ['hq'], expectedVersion: 0 }),
    }));
    expect(grantRes.status).toBe(200);


    // Login as developer
    const devLoginRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
      body: JSON.stringify({ email: 'customer@test.local', password: 'password123456' }),
    }));
    expect(devLoginRes.status).toBe(200);
    const devCookie = devLoginRes.headers.get('set-cookie')!;


    // Negative tests: Developer attempts to call founder finance & business endpoints
    const devOverview = await app.fetch(new Request('http://localhost:3000/api/platform/overview', {
      headers: { 'Cookie': devCookie },
    }));
    expect(devOverview.status).toBe(403);

    const devFinance = await app.fetch(new Request('http://localhost:3000/api/platform/finance/summary', {
      headers: { 'Cookie': devCookie },
    }));
    expect(devFinance.status).toBe(403);

    const devReportBuild = await app.fetch(new Request('http://localhost:3000/api/platform/reports/build?kind=orders', {
      headers: { 'Cookie': devCookie },
    }));
    expect(devReportBuild.status).toBe(403);

    const devExpenses = await app.fetch(new Request('http://localhost:3000/api/platform/expenses', {
      headers: { 'Cookie': devCookie },
    }));
    expect(devExpenses.status).toBe(403);

    // Positive test: Developer can access runtime health and automation jobs
    const devHealth = await app.fetch(new Request('http://localhost:3000/api/platform/health', {
      headers: { 'Cookie': devCookie },
    }));
    expect(devHealth.status).toBe(200);

    const devJobs = await app.fetch(new Request('http://localhost:3000/api/platform/jobs', {
      headers: { 'Cookie': devCookie },
    }));
    expect(devJobs.status).toBe(200);

    cleanup();
  });
});
