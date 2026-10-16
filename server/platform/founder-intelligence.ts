import type { FounderAnalyticsSummary, FounderContentRecord, FounderEventRecord, ContentOutcomeRecord, SocialIdentityRecord, SocialPlatform, IdentityStatus, ContentFunnel, ContentPillar, RightsStatus, ApprovalStatus } from '../../shared/founder-intelligence-contracts';
import { Auth, type Principal } from './auth';
import { fields, fail, id, integer, list, now, object, oneOf, PlatformStore, strings, text, date } from './store';

const platforms = ['instagram','facebook','threads','tiktok','other'] as const;
const identities = ['OFFICIAL_FOUNDER','OFFICIAL_BRAND','RELATED_ENTITY','HISTORICAL','PERSONAL','UNVERIFIED'] as const;
const funnels = ['awareness','trust','conversion','retention'] as const;
const pillars = ['product_proof','customer_reaction','humor','founder','event','operations','cross_brand','other'] as const;
const rights = ['unknown','pending','approved','expired','rejected'] as const;
const approvals = ['draft','pending','approved','rejected'] as const;

export class FounderIntelligence {
  constructor(readonly store: PlatformStore, readonly auth: Auth) {}
  private founder(actor: Principal) { this.auth.founder(actor); }
  identities(actor: Principal) { this.founder(actor); return this.store.all<SocialIdentityRecord>('social_identities'); }
  content(actor: Principal) { this.founder(actor); return this.store.all<FounderContentRecord>('founder_content'); }
  events(actor: Principal) { this.founder(actor); return this.store.all<FounderEventRecord>('founder_events'); }
  saveIdentity(actor: Principal, raw: unknown) {
    this.founder(actor); const input = object(raw); fields(input, ['id','expectedRevision','platform','handle','url','displayName','ownerEntity','relatedEntities','status','confidence','followers','publicViews','linkDestinations','rightsNotes']);
    const existing = input.id ? this.store.require<SocialIdentityRecord>('social_identities', text(input.id)) : null;
    if (existing) this.store.revision(existing.revision, input.expectedRevision);
    const record: SocialIdentityRecord = { id: existing?.id ?? id(), platform: oneOf(input.platform, platforms), handle: text(input.handle, 'Handle', 120), url: text(input.url, 'URL', 500), displayName: text(input.displayName, 'Nama paparan', 200), ownerEntity: text(input.ownerEntity, 'Entity pemilik', 160), relatedEntities: strings(input.relatedEntities ?? [], 20), status: oneOf(input.status, identities), confidence: oneOf(input.confidence ?? 'unknown', ['unknown','low','medium','high'] as const), ...(input.followers === undefined ? {} : { followers: integer(input.followers, 'Followers') }), ...(input.publicViews === undefined ? {} : { publicViews: integer(input.publicViews, 'Views') }), linkDestinations: strings(input.linkDestinations ?? [], 20), ...(input.rightsNotes ? { rightsNotes: text(input.rightsNotes, 'Nota hak', 2000) } : {}), lastVerifiedAt: now(), revision: (existing?.revision ?? 0) + 1, createdAt: existing?.createdAt ?? now() };
    this.store.save('social_identities', record); this.store.audit(actor.user.id, 'social_identity.save', record.id, record.revision); return record;
  }
  saveContent(actor: Principal, raw: unknown) {
    this.founder(actor); const input = object(raw); fields(input, ['id','expectedRevision','identityId','sourceUrl','mediaType','caption','hook','entityId','productIds','eventId','pillar','funnel','cta','rightsStatus','approvalStatus','publishedAt','repurposeStatus','metrics']);
    const existing = input.id ? this.store.require<FounderContentRecord>('founder_content', text(input.id)) : null;
    if (existing) this.store.revision(existing.revision, input.expectedRevision);
    const identityId = text(input.identityId, 'Identity'); this.store.require<SocialIdentityRecord>('social_identities', identityId);
    const metrics = object(input.metrics ?? {}); fields(metrics, ['views','likes','comments','shares','saves','capturedAt']);
    const record: FounderContentRecord = { id: existing?.id ?? id(), identityId, sourceUrl: text(input.sourceUrl, 'URL sumber', 500), mediaType: oneOf(input.mediaType, ['post','reel','video','reply','story','other'] as const), ...(input.caption ? { caption: text(input.caption, 'Caption', 20000) } : {}), ...(input.hook ? { hook: text(input.hook, 'Hook', 2000) } : {}), ...(input.entityId ? { entityId: text(input.entityId, 'Entity', 160) } : {}), productIds: strings(input.productIds ?? [], 50), ...(input.eventId ? { eventId: text(input.eventId, 'Event', 120) } : {}), pillar: oneOf(input.pillar, pillars), funnel: oneOf(input.funnel, funnels), ...(input.cta ? { cta: text(input.cta, 'CTA', 500) } : {}), rightsStatus: oneOf(input.rightsStatus ?? 'unknown', rights), approvalStatus: oneOf(input.approvalStatus ?? 'draft', approvals), ...(input.publishedAt ? { publishedAt: date(input.publishedAt) } : {}), repurposeStatus: oneOf(input.repurposeStatus ?? 'none', ['none','candidate','approved','exported'] as const), metrics: { views: integer(metrics.views ?? 0, 'Views'), likes: integer(metrics.likes ?? 0, 'Likes'), comments: integer(metrics.comments ?? 0, 'Comments'), shares: integer(metrics.shares ?? 0, 'Shares'), saves: integer(metrics.saves ?? 0, 'Saves'), capturedAt: date(metrics.capturedAt ?? now()) }, revision: (existing?.revision ?? 0) + 1, createdAt: existing?.createdAt ?? now() };
    this.store.save('founder_content', record); this.store.audit(actor.user.id, 'founder_content.save', record.id, record.revision); return record;
  }
  saveEvent(actor: Principal, raw: unknown) {
    this.founder(actor); const input = object(raw); fields(input, ['id','expectedRevision','title','location','startsAt','endsAt','status','contentIds','orderIds','leadCount','attendance','notes']);
    const existing = input.id ? this.store.require<FounderEventRecord>('founder_events', text(input.id)) : null; if (existing) this.store.revision(existing.revision, input.expectedRevision);
    const record: FounderEventRecord = { id: existing?.id ?? id(), title: text(input.title, 'Tajuk event', 200), location: text(input.location, 'Lokasi', 300), startsAt: date(input.startsAt), endsAt: date(input.endsAt), status: oneOf(input.status ?? 'planned', ['planned','active','completed','cancelled'] as const), contentIds: strings(input.contentIds ?? [], 100), orderIds: strings(input.orderIds ?? [], 100), leadCount: integer(input.leadCount ?? 0, 'Lead'), ...(input.attendance === undefined ? {} : { attendance: integer(input.attendance, 'Kehadiran') }), ...(input.notes ? { notes: text(input.notes, 'Nota', 5000) } : {}), revision: (existing?.revision ?? 0) + 1, createdAt: existing?.createdAt ?? now() };
    this.store.save('founder_events', record); this.store.audit(actor.user.id, 'founder_event.save', record.id, record.revision); return record;
  }
  linkOutcome(actor: Principal, raw: unknown) {
    this.founder(actor); const input = object(raw); fields(input, ['contentId','kind','orderId','eventId','quantity','note']);
    const contentId = text(input.contentId, 'Content'); this.store.require<FounderContentRecord>('founder_content', contentId);
    if (input.orderId) this.store.require('orders', text(input.orderId)); if (input.eventId) this.store.require('founder_events', text(input.eventId));
    const record: ContentOutcomeRecord = { id: id(), contentId, kind: oneOf(input.kind, ['enquiry','order','dealer_lead','event_lead','complaint','praise'] as const), ...(input.orderId ? { orderId: text(input.orderId) } : {}), ...(input.eventId ? { eventId: text(input.eventId) } : {}), quantity: integer(input.quantity ?? 1, 'Kuantiti', 1), ...(input.note ? { note: text(input.note, 'Nota', 2000) } : {}), recordedAt: now() };
    this.store.save('content_outcomes', record); this.store.audit(actor.user.id, 'content_outcome.link', record.id); return record;
  }
  analytics(actor: Principal): FounderAnalyticsSummary {
    this.founder(actor); const content = this.store.all<FounderContentRecord>('founder_content'); const outcomes = this.store.all<ContentOutcomeRecord>('content_outcomes');
    const byFunnel = Object.fromEntries(funnels.map(f => [f, { contentCount: 0, views: 0, engagements: 0, outcomes: 0 }])) as FounderAnalyticsSummary['byFunnel'];
    const byPillar = Object.fromEntries(pillars.map(p => [p, { contentCount: 0, views: 0, outcomes: 0 }])) as FounderAnalyticsSummary['byPillar'];
    for (const item of content) { const engagements = item.metrics.likes + item.metrics.comments + item.metrics.shares + item.metrics.saves; byFunnel[item.funnel].contentCount++; byFunnel[item.funnel].views += item.metrics.views; byFunnel[item.funnel].engagements += engagements; byFunnel[item.funnel].outcomes += outcomes.filter(o => o.contentId === item.id).reduce((n, o) => n + o.quantity, 0); byPillar[item.pillar].contentCount++; byPillar[item.pillar].views += item.metrics.views; byPillar[item.pillar].outcomes += outcomes.filter(o => o.contentId === item.id).reduce((n, o) => n + o.quantity, 0); }
    return { generatedAt: now(), contentCount: content.length, approvedContentCount: content.filter(c => c.approvalStatus === 'approved').length, totalViews: content.reduce((n,c)=>n+c.metrics.views,0), totalEngagements: content.reduce((n,c)=>n+c.metrics.likes+c.metrics.comments+c.metrics.shares+c.metrics.saves,0), byFunnel, byPillar, linkedOrders: outcomes.filter(o => o.kind === 'order' && !!o.orderId).length, linkedEvents: new Set(outcomes.filter(o => !!o.eventId).map(o => o.eventId)).size, unknownRightsCount: content.filter(c => c.rightsStatus === 'unknown').length };
  }
}
