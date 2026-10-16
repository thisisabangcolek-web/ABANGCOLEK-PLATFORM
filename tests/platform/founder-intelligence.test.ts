import { describe, expect, test } from 'bun:test';
import { createPlatformApp } from '../../server/platform/app';
import { unlinkSync } from 'node:fs';

function cleanup(path: string) { for (const suffix of ['', '-wal', '-shm']) { try { unlinkSync(path + suffix); } catch {} } }

describe('Founder Intelligence vertical slice', () => {
  test('connects founder identity, content, event, order outcome and funnel analytics', async () => {
    const db = `var/lib/qa/founder-intelligence-${Date.now()}.sqlite`; cleanup(db);
    const app = createPlatformApp({ databasePath: db, bootstrapToken: 'fi-bootstrap', origin: 'http://localhost:3000' });
    const boot = await app.fetch(new Request('http://localhost:3000/api/platform/auth/bootstrap', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' }, body: JSON.stringify({ email: 'fi-founder@test.local', password: 'password123456', name: 'Founder FI', token: 'fi-bootstrap' }) }));
    expect(boot.status).toBe(200);
    const cookie = boot.headers.get('set-cookie')!; const csrf = (await boot.clone().json() as any).data.csrfToken;
    const post = (path: string, body: unknown) => app.fetch(new Request(`http://localhost:3000/api/platform${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000', Cookie: cookie, 'x-csrf-token': csrf }, body: JSON.stringify(body) }));
    const get = (path: string) => app.fetch(new Request(`http://localhost:3000/api/platform${path}`, { headers: { Cookie: cookie } }));
    const identityResponse = await post('/founder-intelligence/identities', { platform: 'tiktok', handle: '@styloairpool', url: 'https://www.tiktok.com/@styloairpool', displayName: 'ABANG COLEK', ownerEntity: 'founder', relatedEntities: ['ABANGCOLEK', 'THE FAMOUS JERUX'], status: 'OFFICIAL_FOUNDER', confidence: 'high', linkDestinations: ['https://liurlelehhouse.com'] });
    expect(identityResponse.status).toBe(200); const identity = (await identityResponse.json() as any).data;
    const eventResponse = await post('/founder-intelligence/events', { title: 'Booth Kuching', location: 'Kuching', startsAt: '2026-10-20T10:00:00+08:00', endsAt: '2026-10-20T18:00:00+08:00', status: 'planned' });
    expect(eventResponse.status).toBe(200); const event = (await eventResponse.json() as any).data;
    const contentResponse = await post('/founder-intelligence/content', { identityId: identity.id, sourceUrl: 'https://www.tiktok.com/@styloairpool/video/1', mediaType: 'video', hook: 'Ada yang mengidam?', pillar: 'customer_reaction', funnel: 'conversion', entityId: 'ABANGCOLEK', eventId: event.id, rightsStatus: 'approved', approvalStatus: 'approved', metrics: { views: 1000, likes: 120, comments: 30, shares: 20, saves: 10, capturedAt: '2026-10-15T10:00:00+08:00' } });
    expect(contentResponse.status).toBe(200); const content = (await contentResponse.json() as any).data;
    const outcomeResponse = await post('/founder-intelligence/outcomes', { contentId: content.id, kind: 'event_lead', eventId: event.id, quantity: 7 });
    expect(outcomeResponse.status).toBe(200);
    const analytics = (await (await get('/founder-intelligence/analytics')).json() as any).data;
    expect(analytics.contentCount).toBe(1); expect(analytics.totalViews).toBe(1000); expect(analytics.totalEngagements).toBe(180); expect(analytics.byFunnel.conversion.outcomes).toBe(7); expect(analytics.linkedEvents).toBe(1);
    app.close(); cleanup(db);
  });
});
