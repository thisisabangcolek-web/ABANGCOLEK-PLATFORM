export type SocialPlatform = 'instagram' | 'facebook' | 'threads' | 'tiktok' | 'other';
export type IdentityStatus = 'OFFICIAL_FOUNDER' | 'OFFICIAL_BRAND' | 'RELATED_ENTITY' | 'HISTORICAL' | 'PERSONAL' | 'UNVERIFIED';
export type ContentFunnel = 'awareness' | 'trust' | 'conversion' | 'retention';
export type ContentPillar = 'product_proof' | 'customer_reaction' | 'humor' | 'founder' | 'event' | 'operations' | 'cross_brand' | 'other';
export type RightsStatus = 'unknown' | 'pending' | 'approved' | 'expired' | 'rejected';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type OutcomeKind = 'enquiry' | 'order' | 'dealer_lead' | 'event_lead' | 'complaint' | 'praise';

export interface SocialIdentityRecord {
  id: string; platform: SocialPlatform; handle: string; url: string; displayName: string;
  ownerEntity: string; relatedEntities: string[]; status: IdentityStatus; confidence: 'unknown' | 'low' | 'medium' | 'high';
  followers?: number; publicViews?: number; linkDestinations: string[]; rightsNotes?: string;
  lastVerifiedAt: string; revision: number; createdAt: string;
}

export interface FounderContentRecord {
  id: string; identityId: string; sourceUrl: string; mediaType: 'post' | 'reel' | 'video' | 'reply' | 'story' | 'other';
  caption?: string; hook?: string; entityId?: string; productIds: string[]; eventId?: string;
  pillar: ContentPillar; funnel: ContentFunnel; cta?: string; rightsStatus: RightsStatus; approvalStatus: ApprovalStatus;
  publishedAt?: string; repurposeStatus: 'none' | 'candidate' | 'approved' | 'exported';
  metrics: { views: number; likes: number; comments: number; shares: number; saves: number; capturedAt: string };
  revision: number; createdAt: string;
}

export interface FounderEventRecord {
  id: string; title: string; location: string; startsAt: string; endsAt: string; status: 'planned' | 'active' | 'completed' | 'cancelled';
  contentIds: string[]; orderIds: string[]; leadCount: number; attendance?: number; notes?: string; revision: number; createdAt: string;
}

export interface ContentOutcomeRecord {
  id: string; contentId: string; kind: OutcomeKind; orderId?: string; eventId?: string; quantity: number; note?: string; recordedAt: string;
}

export interface FounderAnalyticsSummary {
  generatedAt: string; contentCount: number; approvedContentCount: number; totalViews: number; totalEngagements: number;
  byFunnel: Record<ContentFunnel, { contentCount: number; views: number; engagements: number; outcomes: number }>;
  byPillar: Record<ContentPillar, { contentCount: number; views: number; outcomes: number }>;
  linkedOrders: number; linkedEvents: number; unknownRightsCount: number;
}
