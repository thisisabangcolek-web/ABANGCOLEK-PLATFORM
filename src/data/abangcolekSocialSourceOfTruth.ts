/**
 * Canonical social evidence for ABANGCOLEK.
 *
 * This file contains only observations captured from the founder's public social
 * profiles on 15 October 2026. It is not a catalogue, pricing ledger, payment
 * source, or historical analytics database.
 */

export type EvidenceStatus = 'OBSERVED_SOCIAL' | 'DERIVED_SNAPSHOT' | 'UNKNOWN' | 'PENDING_FOUNDER_APPROVAL';
export type SocialIdentityStatus = 'OFFICIAL_FOUNDER' | 'RELATED_ENTITY' | 'UNVERIFIED';

export interface SocialAccountEvidence {
  id: string;
  platform: 'tiktok' | 'instagram' | 'facebook' | 'threads';
  handle: string;
  url: string;
  displayName?: string;
  bio?: string;
  identityStatus: SocialIdentityStatus;
  evidenceStatus: EvidenceStatus;
  snapshotDate: string;
  publicMetrics: Record<string, string>;
  relatedEntities: string[];
  observedSignals: string[];
  limitations: string[];
}

export const SOCIAL_EVIDENCE_SNAPSHOT_DATE = '2026-10-15';
export const SOCIAL_EVIDENCE_SOURCE = 'Founder public social profiles reviewed in In-App Browser';

export const SOCIAL_ACCOUNTS: SocialAccountEvidence[] = [
  {
    id: 'tiktok-styloairpool',
    platform: 'tiktok',
    handle: '@styloairpool',
    url: 'https://www.tiktok.com/@styloairpool?lang=en',
    displayName: 'ABANG COLEK 🥭',
    bio: 'Founder | Motivator',
    identityStatus: 'OFFICIAL_FOUNDER',
    evidenceStatus: 'OBSERVED_SOCIAL',
    snapshotDate: SOCIAL_EVIDENCE_SNAPSHOT_DATE,
    publicMetrics: { following: '804', followers: '76.7K', likes: '827.4K' },
    relatedEntities: ['ABANG COLEK', 'THE FAMOUS JERUX'],
    observedSignals: ['PEDAS MANIS LIKAT MELEKAT', 'Rasa Sekali Jatuh Cinta Selamanya', 'founder/motivator', 'produk colek dan jeruk', 'reaksi pelanggan', 'humor/relatable', 'booth/event/komuniti'],
    limitations: ['Snapshot semasa, bukan sejarah analytics', 'Tiada data TikTok Analytics, DM, draft, shop atau conversion', 'Per-video hooks dan metrics belum diaudit satu per satu'],
  },
  {
    id: 'instagram-airpoolstylo',
    platform: 'instagram',
    handle: '@airpoolstylo',
    url: 'https://www.instagram.com/airpoolstylo/',
    displayName: 'airpoolstylo',
    bio: 'FOUNDER OF LIURLELEH HOUSE®️',
    identityStatus: 'OFFICIAL_FOUNDER',
    evidenceStatus: 'OBSERVED_SOCIAL',
    snapshotDate: SOCIAL_EVIDENCE_SNAPSHOT_DATE,
    publicMetrics: { posts: '7,042', followers: '22.8K', following: '1,363' },
    relatedEntities: ['LIURLELEH HOUSE', 'THE FAMOUS JERUX', 'SAMBAGING HQ', 'ABANGCOLEK'],
    observedSignals: ['jeruk buah dalam balang/cawan', 'close-up produk', 'penyediaan dan pembungkusan', 'penghantaran/aktiviti lapangan', 'Sarawak, Kuching dan Sibu', 'event dan perjalanan founder', '#ABANGCOLEK', '#RS5', '#R35'],
    limitations: ['Produk dan label pelbagai entity; bukan semua automatik SKU ABANGCOLEK', 'Link-in-bio dan metrik boleh berubah', 'Snapshot bukan katalog atau ownership proof'],
  },
  {
    id: 'facebook-airpoolstylo',
    platform: 'facebook',
    handle: '/airpoolstylo',
    url: 'https://www.facebook.com/airpoolstylo',
    displayName: 'Megat Shaifulreza Shukor',
    bio: 'FOUNDER & CEO OF LIUR LELEH HOUSE®️',
    identityStatus: 'OFFICIAL_FOUNDER',
    evidenceStatus: 'OBSERVED_SOCIAL',
    snapshotDate: SOCIAL_EVIDENCE_SNAPSHOT_DATE,
    publicMetrics: { followers: '8.2K', following: '1.3K' },
    relatedEntities: ['LIUR LELEH HOUSE', 'THE FAMOUS JERUX', 'ABANGCOLEK'],
    observedSignals: ['ucapan formal dan korporat', 'Hari Raya dan permohonan maaf', 'motivasi kerja', 'aktiviti founder', 'pengumuman dan hubungan awam', 'location Kuala Lumpur', '#liurlelehhouse', '#thefamousjerux', '#tfj'],
    limitations: ['Kandungan personal, founder dan corporate bercampur', 'Tidak boleh dianggap katalog produk', 'Relationship legal antara entity belum disahkan'],
  },
  {
    id: 'threads-airpoolstylo',
    platform: 'threads',
    handle: '@airpoolstylo',
    url: 'https://www.threads.com/@airpoolstylo',
    displayName: 'FOUNDER OF LIURLELEH HOUSE®️',
    bio: 'ABANG COLEK 🥭 · AN INDESCRIBABLE SENSATION · CLICK & ORDER NOW',
    identityStatus: 'OFFICIAL_FOUNDER',
    evidenceStatus: 'OBSERVED_SOCIAL',
    snapshotDate: SOCIAL_EVIDENCE_SNAPSHOT_DATE,
    publicMetrics: { followers: '5,504', recentViews: '1.3M contextual profile summary' },
    relatedEntities: ['LIURLELEH HOUSE', 'ABANGCOLEK'],
    observedSignals: ['conversation dan pendapat founder', 'discovery melalui reply/repost', 'ABANG COLEK mention', 'CTA order', 'link-in-bio'],
    limitations: ['Recent views ialah contextual profile summary', 'Feed bercampur dengan kandungan umum', 'Post-by-post audit memerlukan scope khusus'],
  },
  {
    id: 'facebook-thejeruxman',
    platform: 'facebook',
    handle: '/TheJeruxMan',
    url: 'https://www.facebook.com/TheJeruxMan',
    displayName: 'Megat Shaifulreza Bin Ab Shukor',
    bio: 'Entrepreneur',
    identityStatus: 'RELATED_ENTITY',
    evidenceStatus: 'OBSERVED_SOCIAL',
    snapshotDate: SOCIAL_EVIDENCE_SNAPSHOT_DATE,
    publicMetrics: { followers: 'about 101' },
    relatedEntities: ['THE FAMOUS JERUX', 'LIURLELEH HOUSE'],
    observedSignals: ['The Jerux', 'GTR35', 'founder lifestyle', 'liurlelehhouse.com'],
    limitations: ['Jangan auto-merge dengan ABANGCOLEK', 'Ownership dan fungsi akaun perlu pengesahan founder'],
  },
];

export interface ObservedProductSignal {
  id: string;
  name: string;
  entity: string;
  status: EvidenceStatus;
  sources: string[];
  observedDescription: string;
  notProven: string[];
}

export const OBSERVED_PRODUCT_SIGNALS: ObservedProductSignal[] = [
  {
    id: 'cup-fruit-colek',
    name: 'Colek buah dalam cawan',
    entity: 'ABANG COLEK / ABANG COLEX — spelling pending founder approval',
    status: 'OBSERVED_SOCIAL',
    sources: ['TikTok @styloairpool profile review', 'Instagram @airpoolstylo profile review'],
    observedDescription: 'Potongan buah dengan kuah/colek pekat dalam cawan; visual label “ABANG COLEX” kelihatan pada aset tertentu.',
    notProven: ['SKU rasmi', 'harga', 'berat/isipadu', 'bahan', 'stok semasa', 'legal ownership'],
  },
  {
    id: 'jar-sambal-colek',
    name: 'Sambal Colek dalam balang',
    entity: 'ABANG COLEK / related entity pending mapping',
    status: 'OBSERVED_SOCIAL',
    sources: ['TikTok @styloairpool launch video and profile review', 'Instagram @airpoolstylo profile review'],
    observedDescription: 'Balang dengan penutup hitam dan label merah jambu; kandungan sosial memaparkan sambal/colek.',
    notProven: ['SKU rasmi', 'harga', 'berat/isipadu', 'ramuan', 'shelf life', 'stok semasa', 'legal ownership'],
  },
  {
    id: 'fruit-pickles',
    name: 'Jeruk/buah dalam balang atau cawan',
    entity: 'THE FAMOUS JERUX / LIURLELEH HOUSE — not auto-ABANGCOLEK',
    status: 'OBSERVED_SOCIAL',
    sources: ['Instagram @airpoolstylo profile review', 'TikTok @styloairpool profile review'],
    observedDescription: 'Jeruk buah dan buah hijau/mangga/kedondong kelihatan dalam kandungan founder.',
    notProven: ['ABANGCOLEK SKU mapping', 'harga', 'variasi rasmi', 'legal ownership'],
  },
];

export const OBSERVED_CONTENT_PILLARS = [
  { id: 'sensory-proof', label: 'Sensory proof', evidence: 'Close-up buah, kuah pekat, tekstur, gigitan dan reaksi rasa' },
  { id: 'customer-reaction', label: 'Reaksi pelanggan', evidence: 'First try, soalan, usikan dan reaksi spontan terhadap pedas/masam/kuah' },
  { id: 'humor-relatable', label: 'Humor / relatable', evidence: 'Situasi kereta, motor, kasut, parking, dialog santai dan lifestyle' },
  { id: 'founder-motivation', label: 'Founder / motivasi', evidence: 'Perjalanan, ketahanan, target market, branding values dan “Ingat balik kenapa kite mula”' },
  { id: 'event-community', label: 'Event / komuniti', evidence: 'Booth, crowd, packing, event, lokasi dan aktiviti lapangan' },
  { id: 'cross-entity', label: 'Cross-entity discovery', evidence: 'ABANG COLEK, THE FAMOUS JERUX dan Liur Leleh House muncul dalam ekosistem yang sama tetapi perlu dipetakan berasingan' },
];

export const OBSERVED_TIKTOK_POPULAR_VIEW_SNAPSHOTS = [
  { approximateViews: '1.4M', format: 'humor / relatable', status: 'OBSERVED_SOCIAL' as const },
  { approximateViews: '1.3M', format: 'humor / relatable', status: 'OBSERVED_SOCIAL' as const },
  { approximateViews: '811.3K', format: 'humor / relatable', status: 'OBSERVED_SOCIAL' as const },
  { approximateViews: '845.5K', format: 'humor / relatable', status: 'OBSERVED_SOCIAL' as const },
  { approximateViews: '784.4K', format: 'humor / relatable', status: 'OBSERVED_SOCIAL' as const },
  { approximateViews: '433.6K', format: 'popular video', status: 'OBSERVED_SOCIAL' as const },
  { approximateViews: '342.2K', format: 'popular video', status: 'OBSERVED_SOCIAL' as const },
  { approximateViews: '321K', format: 'popular video', status: 'OBSERVED_SOCIAL' as const },
];

export const VERIFIED_SOCIAL_TAGLINES = [
  { id: 'tiktok-tagline', text: 'PEDAS MANIS LIKAT MELEKAT', source: 'TikTok @styloairpool profile snapshot', status: 'OBSERVED_SOCIAL' as const },
  { id: 'tiktok-slogan', text: 'Rasa Sekali Jatuh Cinta Selamanya', source: 'TikTok @styloairpool profile snapshot', status: 'OBSERVED_SOCIAL' as const },
  { id: 'threads-sensation', text: 'AN INDESCRIBABLE SENSATION', source: 'Threads @airpoolstylo profile snapshot', status: 'OBSERVED_SOCIAL' as const },
];
