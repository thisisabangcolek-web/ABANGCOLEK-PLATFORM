$path = 'D:\ABANGCOLEK-PLATFORM\src\services\abangColekRepoData.ts'
$text = [IO.File]::ReadAllText($path)
$nl = "`r`n"
function Replace-Once([string]$pattern, [string]$replacement) {
  $script:text = [regex]::Replace($script:text, $pattern, $replacement, [Text.RegularExpressions.RegexOptions]::Singleline)
}
Replace-Once 'export const BOOTH_OPS_CHECKLISTS = \{.*?\};\r?\n\r?\n// 5\. WhatsApp Message Templates' ('// Draft SOP only; it is not a record of what happened at a real event.' + $nl + 'export const BOOTH_OPS_CHECKLISTS = {' + $nl + '  preEvent: ["Sahkan event, tarikh, lokasi dan authority secara manual", "Padankan produk/asset yang approved dengan event", "Semak stok sebenar dan rekod lot", "Sahkan rights untuk rakaman dan wajah", "Sediakan shot list content tanpa membuat claim stok/harga"],' + $nl + '  duringEvent: ["Rekod lokasi dan masa sebenar", "Ambil consent jika rakam pelanggan", "Catat enquiry sebagai lead, bukan order", "Jangan umum harga/stok tanpa approval", "Simpan source media asal"],' + $nl + '  postEvent: ["Reconcile stok dan order daripada record sebenar", "Asingkan content reach daripada conversion", "Pautkan content kepada event/entity", "Tandakan unknown/pending claim", "Buat post-mortem dengan evidence"]' + $nl + '};' + $nl + $nl + '// 5. WhatsApp Message Templates')
Replace-Once 'export const PITCH_DECK_SLIDES: PitchDeckSlide\[\] = \[.*?\];\r?\n\r?\n// 10\. Official Brand Manifestos' @'
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

// 10. Brand Manifestos'@)
Replace-Once 'export const BRAND_MANIFESTOS = \[.*?\];\r?\n\r?\n// 11\. TikTok SOP Posting Cadence & Golden Rules' @'
export const BRAND_MANIFESTOS = [
  { id: "working-principle-1", title: "Observed principle: real people", text: "Public content repeatedly shows founder presence, customer reactions, event activity and product experiences. This is an observation, not a founder-approved manifesto." },
  { id: "working-principle-2", title: "Working principle: evidence before claim", text: "Use social content to understand identity and content patterns. Do not convert a post into price, SKU, stock, payment or ownership truth without a separate approved record." }
];

// 11. TikTok observed content patterns and draft guardrails'@)
Replace-Once 'export const TIKTOK_WEEKLY_CADENCE = \[.*?\];\r?\n\r?\nexport const TIKTOK_GOLDEN_RULES = \[.*?\];' @'
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
];'@)
[IO.File]::WriteAllText($path, $text, [Text.UTF8Encoding]::new($false))
Write-Output "Updated $path"
