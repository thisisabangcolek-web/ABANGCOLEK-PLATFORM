/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ABANG COLEK OFFICIAL REPOSITORY DATA & WOCS INTELLIGENCE SERVICE
 * Extracted directly from https://github.com/thisisniagahub/ABANG-COLEK.git
 */

export interface TikTokViralHook {
  id: string;
  text: string;
  tags: string[];
  performance: {
    views: number;
    likes: number;
    shares: number;
    engagement: number;
  };
  usedCount: number;
  lastUsed?: string;
  createdAt: string;
}

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  category: "business" | "product" | "growth" | "founder";
}

export interface BrandTagline {
  id: string;
  text: string;
  context: "formal" | "social" | "emotional";
  emoji: string;
}

export type SocialEvidenceStatus = "OBSERVED_SOCIAL" | "PENDING_FOUNDER_APPROVAL" | "QUARANTINED";

export interface QuarantinedSocialRecord<T> {
  status: SocialEvidenceStatus;
  reason: string;
  source: string;
  capturedAt: string;
  value: T;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: "customer_service" | "event" | "lucky_draw" | "order" | "marketing";
  trigger: string[];
  message: string;
  requiresAdmin: boolean;
  variables?: string[];
  createdAt: string;
}

export interface WocsParsedCommand {
  type: "landing_page" | "app_config" | "agent_task" | "content_schedule" | "report" | "tiktok" | "unknown";
  payload: Record<string, string>;
  raw: string;
  requiresApproval: boolean;
}

export interface WocsExecutionResult {
  ok: boolean;
  message: string;
  data?: Record<string, unknown>;
  requiresAdminApproval?: boolean;
}

// 1. TikTok Viral Hooks Bank
// QUARANTINED: tiada hook per-video dan metrik yang disahkan dalam snapshot sosial.
export const TIKTOK_VIRAL_HOOKS: TikTokViralHook[] = [];

// 2. Motivational Quotes Bank
export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  { id: "social-pending-1", quote: "Tiada petikan founder yang disahkan secara post-level dalam snapshot ini.", author: "Status: PENDING_FOUNDER_APPROVAL", category: "founder" }
];

// 3. Taglines
// Official brand copy must not be promoted from an unapproved social snapshot.
export const BRAND_TAGLINES: BrandTagline[] = [];

export const QUARANTINED_BRAND_TAGLINES: QuarantinedSocialRecord<BrandTagline[]> = {
  status: "PENDING_FOUNDER_APPROVAL",
  reason: "Observed in social material, but not approved as the current official brand manifest.",
  source: "social snapshot referenced by the repository data review",
  capturedAt: "UNKNOWN",
  value: [
  { id: "social-tagline-1", text: "PEDAS MANIS LIKAT MELEKAT", context: "social", emoji: "🌶️🥭" },
  { id: "social-tagline-2", text: "Rasa Sekali Jatuh Cinta Selamanya", context: "emotional", emoji: "❤️" },
  { id: "social-tagline-3", text: "AN INDESCRIBABLE SENSATION", context: "social", emoji: "" }
  ]
};

// 4. Booth Ops Checklists
// This is a draft operational template, not evidence that an event, stock or payment setup exists.
export const BOOTH_OPS_CHECKLISTS = {
  preEvent: [
    "Semak inventory sambal (kiraan botol/pek)",
    "Sediakan kelengkapan booth (meja, kain skirting, banner, standee)",
    "Print QR code untuk cabutan bertuah (lucky draw)",
    "Cas penuh power bank, terminal kad dan phone",
    "Sediakan tunai apung / cash float (duit kecil)",
    "Bungkus merchandise (sticker, flyer, business card)",
    "Siapkan cooler box bersama ice pack",
    "Brief staff tentang USP produk dan struktur pricing",
    "Sahkan kaedah pembayaran yang diluluskan owner sebelum acara",
    "Sediakan shot list untuk rakaman video TikTok"
  ],
  duringEvent: [
    "Setup booth dan susun produk 30 minit sebelum acara bermula",
    "Display produk secara bertingkat dan kemas",
    "Pasang banner dan standee di laluan utama",
    "Sambut pelanggan dengan senyuman dan sapaan mesra",
    "Rakam reaksi jujur pelanggan semasa ujian rasa percuma",
    "Promote pendaftaran kod QR lucky draw",
    "Pantau stok sambal setiap 2 jam",
    "Jalin hubungan baik dengan pelanggan (community building)",
    "Rakam detik-detik behind-the-scenes",
    "Catat soalan lazim dan maklum balas pelanggan"
  ],
  postEvent: [
    "Kemas semua peralatan dengan rapi dan selamat",
    "Kira jumlah jualan tunai + QR dan baki stok",
    "Kumpul borang maklum balas dan ulasan",
    "Pindahkan video rakaman dari phone ke storan",
    "Kemas kini sistem inventori",
    "Ucap terima kasih kepada Event Organizer (EO) dan simpan kontak",
    "Muat naik sorotan video ke TikTok dan Instagram",
    "Buat post-mortem: apa yang berjaya dan apa yang perlu ditambah baik",
    "Rehat dan raikan pencapaian hari ini! 🎉"
  ]
};

// 5. WhatsApp Message Templates
// QUARANTINED: harga, promosi, lokasi, bank details dan WhatsApp API tidak terbukti melalui audit sosial.
export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [];

// 6. Official Audio Anthem Metadata
// QUARANTINED: audio identity belum disahkan sebagai aset rasmi melalui source/rights evidence.
export const OFFICIAL_AUDIO_IDENTITY = null;

// 7. WOCS Command Parser (Mirror of server/wocs/commandParser.ts)
export function parseWocsCommand(raw: string): WocsParsedCommand {
  const trimmed = raw.trim();
  const normalized = trimmed.replace(/^\/+/, "");
  const [keyword, ...rest] = normalized.split(/\s+/);

  const payload: Record<string, string> = {};
  for (const token of rest) {
    const [key, ...valParts] = token.split("=");
    if (key && valParts.length > 0) {
      payload[key.trim()] = valParts.join("=").trim();
    }
  }

  if (!keyword) {
    return { type: "unknown", payload: {}, raw, requiresApproval: false };
  }

  switch (keyword.toLowerCase()) {
    case "landing":
      return { type: "landing_page", payload, raw, requiresApproval: true };
    case "config":
      return { type: "app_config", payload, raw, requiresApproval: true };
    case "assign":
      return { type: "agent_task", payload, raw, requiresApproval: false };
    case "schedule":
      return { type: "content_schedule", payload, raw, requiresApproval: false };
    case "report":
      return { type: "report", payload, raw, requiresApproval: false };
    case "tiktok":
      return { type: "tiktok", payload, raw, requiresApproval: false };
    default:
      return { type: "unknown", payload, raw, requiresApproval: false };
  }
}

// 8. WOCS Executor Simulation (Mirror of server/wocs/executors.ts)
export function executeWocsCommand(cmd: WocsParsedCommand): WocsExecutionResult {
  switch (cmd.type) {
    case "landing_page": {
      const pageSlug = cmd.payload.pageSlug || "promo-merdeka";
      return {
        ok: true,
        message: `Draf versi Landing Page untuk [${pageSlug}] telah disimpan ke pangkalan data wocs_landing_versions.`,
        requiresAdminApproval: true,
        data: { pageSlug, version: Date.now(), status: "draft" }
      };
    }
    case "app_config": {
      const configKey = cmd.payload.configKey || "featureFlags";
      return {
        ok: true,
        message: `Konfigurasi aplikasi [${configKey}] dikemas kini secara automatik.`,
        requiresAdminApproval: true,
        data: { configKey, updatedBy: "Admin WOCS", status: "applied" }
      };
    }
    case "agent_task": {
      const task = cmd.payload.task || "Semak inventori cawangan";
      const agent = cmd.payload.agent || "Agent-Siti";
      return {
        ok: true,
        message: `Tugasan [${task}] berjaya diagihkan kepada [${agent}].`,
        data: { agent, task, status: "assigned", timestamp: new Date().toISOString() }
      };
    }
    case "content_schedule": {
      const date = cmd.payload.date || "Esok 8:00 PM";
      const hook = cmd.payload.hook || "hook-1";
      return {
        ok: true,
        message: `Jadual kandungan video TikTok telah didaftarkan untuk [${date}] menggunakan cangkuk [${hook}].`,
        data: { date, hook, platform: "tiktok", scheduled: true }
      };
    }
    case "report": {
      const range = cmd.payload.range || "7d";
      return {
        ok: true,
        message: `Laporan prestasi jualan bagi julat [${range}] berjaya dijana.`,
        data: { range, generatedAt: new Date().toISOString(), status: "ready" }
      };
    }
    case "tiktok": {
      const action = cmd.payload.action || "create_draft";
      return {
        ok: true,
        message: `Tindakan TikTok [${action}] telah dimasukkan ke dalam barisan giliran pemprosesan.`,
        data: { action, queueStatus: "enqueued" }
      };
    }
    default:
      return {
        ok: false,
        message: `Arahan [${cmd.raw}] tidak dikenali. Taip /help atau cuba /landing, /config, /assign, /schedule, /report, atau /tiktok.`
      };
  }
}

// 9. Social-evidence pitch outline (not investor traction proof)
export interface PitchDeckSlide {
  id: string;
  slideNumber: number;
  title: string;
  category: "Vision" | "Market" | "Product" | "Strategy" | "Traction";
  body: string;
  highlight?: string;
}

export const PITCH_DECK_SLIDES: PitchDeckSlide[] = [
  { id: "social-slide-1", slideNumber: 1, title: "ABANG COLEK", category: "Vision", body: "Founder-led F&B identity observed across public social profiles.", highlight: "Founder-led social identity" },
  { id: "social-slide-2", slideNumber: 2, title: "Founder signal", category: "Vision", body: "@styloairpool appears as the founder/motivator identity across TikTok, Instagram, Facebook and Threads snapshots.", highlight: "One founder identity, several platform roles" },
  { id: "social-slide-3", slideNumber: 3, title: "Observed product signals", category: "Product", body: "Public content shows colek fruit, sambal/colek in jars and fruit pickles. SKU, price, size and ownership remain unverified.", highlight: "Visual proof is not a catalogue" },
  { id: "social-slide-4", slideNumber: 4, title: "Content engine", category: "Strategy", body: "Sensory proof, customer reaction, humour, founder motivation, event/community and cross-entity discovery are visible pillars.", highlight: "Content pillars from social evidence" },
  { id: "social-slide-5", slideNumber: 5, title: "Platform roles", category: "Strategy", body: "TikTok drives reach; Instagram shows product proof; Facebook carries authority; Threads carries conversation and CTA.", highlight: "Different funnel jobs" },
  { id: "social-slide-6", slideNumber: 6, title: "Entity separation", category: "Strategy", body: "ABANG COLEK, THE FAMOUS JERUX and LIURLELEH HOUSE appear related but must remain separately mapped until founder approval.", highlight: "Related is not identical" },
  { id: "social-slide-7", slideNumber: 7, title: "Evidence boundary", category: "Traction", body: "Social metrics are snapshots. They do not prove stock, price, margin, payment details, legal ownership or conversion.", highlight: "Snapshot, not ledger" },
  { id: "social-slide-8", slideNumber: 8, title: "Platform direction", category: "Traction", body: "ABANGCOLEK-PLATFORM should connect identity → content → product/entity → enquiry → event/order/dealer → evidence → learning.", highlight: "Founder-led Social Commerce OS" }
];
// 10. Working principles derived from social evidence, not approved manifestos

export const BRAND_MANIFESTOS = [
  { id: "working-principle-1", title: "Observed principle: real people", text: "Public content repeatedly shows founder presence, customer reactions, event activity and product experiences. This is an observation, not a founder-approved manifesto." },
  { id: "working-principle-2", title: "Working principle: evidence before claim", text: "Use social content to understand identity and content patterns. Do not convert a post into price, SKU, stock, payment or ownership truth without a separate approved record." }
];

// 11. TikTok observed content patterns and draft guardrails

// 11. TikTok SOP Posting Cadence & Golden Rules
export const TIKTOK_WEEKLY_CADENCE = [
  { day: "Observed", focus: "Sensory proof", description: "Close-up buah, kuah pekat, tekstur, gigitan dan reaksi rasa." },
  { day: "Observed", focus: "Customer reaction", description: "First try, soalan, usikan dan reaksi spontan terhadap pedas/masam/kuah." },
  { day: "Observed", focus: "Humor / relatable", description: "Situasi kereta, motor, kasut, parking dan dialog santai." },
  { day: "Observed", focus: "Founder / event", description: "Motivasi, perjalanan, booth, packing, event dan aktiviti lapangan." }
];

export const TIKTOK_GOLDEN_RULES = [
  "Labelkan post sebagai observed social atau approved commercial content.",
  "Pautkan setiap product claim kepada source URL atau evidence record.",
  "Pisahkan reach content daripada conversion content.",
  "Jangan gunakan caption lama untuk mengesahkan harga, stok, berat atau payment.",
  "Kekalkan founder approval sebelum publish claim, offer atau reply sensitif."
];


// 12. TikTok Profile Metrics & Bio Architecture (@styloairpool)
// Safe export: no social snapshot metric or bio is treated as current official data.
export const TIKTOK_PROFILE_METRICS = {
  handle: "@styloairpool",
  brandName: "UNKNOWN — observed display name requires founder approval",
  founderName: "UNKNOWN — founder identity is not normalized here",
  followers: "UNKNOWN — social snapshot quarantined",
  likes: "UNKNOWN — social snapshot quarantined",
  likesPerFollower: "UNKNOWN — no derived metric stored as evidence",
  bio: "UNKNOWN — current bio requires a dated source snapshot and founder approval",
  emojiStrategy: [
    { emoji: "UNKNOWN", meaning: "Not approved as brand architecture" }
  ]
};

export const QUARANTINED_TIKTOK_PROFILE_METRICS: QuarantinedSocialRecord<{
  handle: string;
  brandName: string;
  founderName: string;
  followers: string;
  likes: string;
  bio: string;
  emojiStrategy: Array<{ emoji: string; meaning: string }>;
}> = {
  status: "QUARANTINED",
  reason: "Social metrics and profile copy are snapshots; they do not prove current reach, ownership, product availability or approved brand language.",
  source: "TikTok profile snapshot referenced by the repository data review",
  capturedAt: "UNKNOWN",
  value: {
    handle: "@styloairpool",
    brandName: "ABANG COLEK 🥭",
    founderName: "UNKNOWN — founder name observed on Facebook, not normalized here",
    followers: "76.7K",
    likes: "827.4K",
    bio: "Founder | Motivator 📈\nPEDAS MANIS LIKAT MELEKAT 🌶️🥭\n\"Rasa Sekali Jatuh Cinta Selamanya\"",
    emojiStrategy: [
      { emoji: "🌶️", meaning: "Cili & Pedas Ekstrem" },
      { emoji: "🥭", meaning: "Mangga Lemak Manis Pembeda" },
      { emoji: "📈", meaning: "Pertumbuhan Usahawan & Motivasi" }
    ]
  }
};
