import { describe, expect, test } from 'bun:test';
import { createPlatformApp } from '../../server/platform/app';
import { createDefaultAutomationOptions, LocalPostizTransport } from '../../server/automation/runtimeTransports';
import { unlinkSync } from 'node:fs';

function cleanup(dbPath: string) {
  for (const ext of ['', '-wal', '-shm']) {
    try { unlinkSync(dbPath + ext); } catch { /* ignore */ }
  }
}

async function createTestContext(testId: string, withAutomation = true, customPostizTransport?: any) {
  const testDb = `var/lib/qa/postiz-marketing-${testId}.sqlite`;
  cleanup(testDb);

  const autoOptions = withAutomation ? createDefaultAutomationOptions() : undefined;
  if (autoOptions && customPostizTransport) {
    autoOptions.postiz = customPostizTransport;
  }

  const app = createPlatformApp({
    databasePath: testDb,
    bootstrapToken: 'test-bootstrap-token-postiz',
    origin: 'http://localhost:3000',
    automationOptions: autoOptions,
  });

  // Bootstrap founder
  const bootRes = await app.fetch(new Request('http://localhost:3000/api/platform/auth/bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      email: `founder-postiz-${testId}@test.local`,
      password: 'password123456',
      name: 'Founder Postiz Test',
      token: 'test-bootstrap-token-postiz',
    }),
  }));
  expect(bootRes.status).toBe(200);
  const bootData = await bootRes.json() as { data: { user: { id: string }; csrfToken: string } };
  const founderCookie = bootRes.headers.get('set-cookie')!;
  const founderCsrf = bootData.data.csrfToken;

  return { app, founderCookie, founderCsrf, testDb };
}

describe('E03: Postiz Social Marketing Adapter & Pilot Publishing', () => {
  test('without transport injection, health reports unavailable and publish is blocked', async () => {
    const { app, founderCookie, founderCsrf, testDb } = await createTestContext('no-transport', false);

    const healthRes = await app.fetch(new Request('http://localhost:3000/api/platform/health', {
      headers: { 'Cookie': founderCookie },
    }));
    expect(healthRes.status).toBe(200);
    const health = await healthRes.json() as { data: { component: string; status: string }[] };
    expect(health.data.find(c => c.component === 'postiz')?.status).toBe('unavailable');

    // Create campaign
    const createRes = await app.fetch(new Request('http://localhost:3000/api/platform/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-create-camp-001',
      },
      body: JSON.stringify({
        title: 'Kempen Sambal Colek Ramadhan',
        objective: 'Meningkatkan kesedaran produk',
        copy: 'Dapatkan sambal colek asli di outlet berhampiran!',
        assets: [],
        productIds: [],
        catalogueVersion: 0,
      }),
    }));
    expect(createRes.status).toBe(200);
    const campaign = (await createRes.json() as any).data;

    // Approve campaign
    const approveRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
      },
      body: JSON.stringify({
        expectedRevision: 1,
        approvalExpiresAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
      }),
    }));
    expect(approveRes.status).toBe(200);

    // Attempt publish without transport
    const pubRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/postiz-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-postiz-001',
      },
      body: JSON.stringify({
        expectedRevision: 2,
        channel: 'local-pilot',
      }),
    }));
    expect(pubRes.status).toBe(200);
    const pubOutcome = (await pubRes.json() as any).data;
    expect(pubOutcome.status).toBe('blocked');
    expect(pubOutcome.reasonCode).toBe('REMOTE_PUBLISH_DISABLED');

    cleanup(testDb);
  });

  test('validates exact revision approval, expiry, and channel scope before publish', async () => {
    const { app, founderCookie, founderCsrf, testDb } = await createTestContext('validation-suite', true);

    // Create campaign
    const createRes = await app.fetch(new Request('http://localhost:3000/api/platform/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-create-camp-002',
      },
      body: JSON.stringify({
        title: 'Kempen Diskaun Akhir Tahun',
        objective: 'Jualan habiskan stok',
        copy: 'Beli 2 percuma 1!',
        assets: [],
        productIds: [],
        catalogueVersion: 0,
      }),
    }));
    const campaign = (await createRes.json() as any).data;

    // 1. Unapproved publish fails with 409 APPROVAL_REQUIRED
    const unapprovedRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/postiz-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-unapproved-1',
      },
      body: JSON.stringify({
        expectedRevision: 1,
        channel: 'local-pilot',
      }),
    }));
    expect(unapprovedRes.status).toBe(409);
    expect((await unapprovedRes.json() as any).code).toBe('APPROVAL_REQUIRED');

    // 2. Approve with past expiry date
    const approveRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
      },
      body: JSON.stringify({
        expectedRevision: 1,
        approvalExpiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
      }),
    }));
    expect(approveRes.status).toBe(200);

    // 3. Stale revision fails with 409
    const staleRevRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/postiz-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-stale-rev',
      },
      body: JSON.stringify({
        expectedRevision: 99,
        channel: 'local-pilot',
      }),
    }));
    expect(staleRevRes.status).toBe(409);

    // 4. Unsupported channel is blocked
    const badChannelRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/postiz-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-bad-channel',
      },
      body: JSON.stringify({
        expectedRevision: 2,
        channel: 'unsupported-tiktok-enterprise',
      }),
    }));
    expect(badChannelRes.status).toBe(200);
    const badChannelOutcome = (await badChannelRes.json() as any).data;
    expect(badChannelOutcome.status).toBe('blocked');
    expect(badChannelOutcome.reasonCode).toBe('CHANNEL_NOT_SUPPORTED');

    cleanup(testDb);
  });

  test('executes approved one-channel pilot publish, manual export separation, and idempotent replay', async () => {
    const { app, founderCookie, founderCsrf, testDb } = await createTestContext('pilot-success', true);

    // Create & approve campaign
    const createRes = await app.fetch(new Request('http://localhost:3000/api/platform/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-create-camp-003',
      },
      body: JSON.stringify({
        title: 'Kempen Pelancaran Rasmi',
        objective: 'Jualan balang pertama',
        copy: 'Sambal colek kini rasmi boleh didapati!',
        assets: [],
        productIds: [],
        catalogueVersion: 0,
      }),
    }));
    const campaign = (await createRes.json() as any).data;

    await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
      },
      body: JSON.stringify({
        expectedRevision: 1,
        approvalExpiresAt: new Date(Date.now() + 14 * 24 * 3600_000).toISOString(),
      }),
    }));

    // Manual export remains available with status 'exported'
    const exportRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-export-001',
      },
      body: JSON.stringify({
        expectedRevision: 2,
        format: 'text',
      }),
    }));
    expect(exportRes.status).toBe(200);
    const exportData = (await exportRes.json() as any).data;
    expect(exportData.status).toBe('exported');
    expect(exportData.content).toContain('Sambal colek kini rasmi');

    // Publish pilot via Postiz
    const pubRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/postiz-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-publish-pilot-001',
      },
      body: JSON.stringify({
        expectedRevision: 2,
        channel: 'local-pilot',
        accountId: 'acct-abangcolek-my',
      }),
    }));
    expect(pubRes.status).toBe(200);
    const pubData = (await pubRes.json() as any).data;
    expect(pubData.status).toBe('published');
    expect(pubData.providerRef).toMatch(/^postiz-/);
    expect(pubData.reasonCode).toBe('POSTIZ_PUBLISHED');

    // Idempotent replay with same key returns identical receipt
    const replayRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/postiz-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-publish-pilot-001',
      },
      body: JSON.stringify({
        expectedRevision: 2,
        channel: 'local-pilot',
        accountId: 'acct-abangcolek-my',
      }),
    }));
    expect(replayRes.status).toBe(200);
    const replayData = (await replayRes.json() as any).data;
    expect(replayData.intentId).toBe(pubData.intentId);
    expect(replayData.providerRef).toBe(pubData.providerRef);

    cleanup(testDb);
  });

  test('reconciles unknown outcome and supports cancel flow', async () => {
    // Custom transport simulating unknown outcome followed by successful reconciliation
    let publishAttempt = 0;
    const flakyTransport = {
      zeroNewSpend: true as const,
      channel: 'local-pilot' as const,
      async publish(intent: any) {
        publishAttempt++;
        return {
          providerRef: 'postiz-flaky-999',
          status: 'unknown' as const,
          reasonCode: 'NETWORK_TIMEOUT_UNCONFIRMED',
        };
      },
      async reconcile(providerRef: string) {
        return {
          providerRef,
          status: 'published' as const,
          url: 'https://postiz.local/posts/postiz-flaky-999',
          reasonCode: 'REMOTE_CONFIRMED',
        };
      },
      async cancel(providerRef: string) {
        return {
          providerRef,
          status: 'cancelled' as const,
          evidenceIds: [],
        };
      },
    };

    const { app, founderCookie, founderCsrf, testDb } = await createTestContext('flaky-postiz', true, flakyTransport);

    // Create & approve campaign
    const createRes = await app.fetch(new Request('http://localhost:3000/api/platform/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-create-camp-004',
      },
      body: JSON.stringify({
        title: 'Kempen Flaky Test',
        objective: 'Test reconciliation',
        copy: 'Test post content',
        assets: [],
        productIds: [],
        catalogueVersion: 0,
      }),
    }));
    const campaign = (await createRes.json() as any).data;

    await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
      },
      body: JSON.stringify({
        expectedRevision: 1,
        approvalExpiresAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
      }),
    }));

    // 1. Initial publish returns unknown status
    const pubRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/postiz-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-flaky-001',
      },
      body: JSON.stringify({
        expectedRevision: 2,
        channel: 'local-pilot',
      }),
    }));
    expect(pubRes.status).toBe(200);
    const pubData = (await pubRes.json() as any).data;
    expect(pubData.status).toBe('unknown');

    // 2. Re-trying publish before reconciliation is rejected with 409 RECONCILIATION_REQUIRED
    const retryRes = await app.fetch(new Request(`http://localhost:3000/api/platform/campaigns/${campaign.id}/postiz-publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
        'idempotency-key': 'idem-flaky-001',
      },
      body: JSON.stringify({
        expectedRevision: 2,
        channel: 'local-pilot',
      }),
    }));
    expect(retryRes.status).toBe(409);
    expect((await retryRes.json() as any).code).toBe('RECONCILIATION_REQUIRED');

    // 3. Reconcile endpoint succeeds and updates status
    const recRes = await app.fetch(new Request('http://localhost:3000/api/platform/automation/postiz/reconcile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
      },
      body: JSON.stringify({
        intentId: pubData.intentId,
        providerRef: 'postiz-flaky-999',
      }),
    }));
    expect(recRes.status).toBe(200);
    const recData = (await recRes.json() as any).data;
    expect(recData.status).toBe('published');

    // 4. Cancel endpoint succeeds
    const cancelRes = await app.fetch(new Request('http://localhost:3000/api/platform/automation/postiz/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Cookie': founderCookie,
        'x-csrf-token': founderCsrf,
      },
      body: JSON.stringify({
        providerRef: 'postiz-flaky-999',
      }),
    }));
    expect(cancelRes.status).toBe(200);
    const cancelData = (await cancelRes.json() as any).data;
    expect(cancelData.status).toBe('cancelled');

    cleanup(testDb);
  });
});
