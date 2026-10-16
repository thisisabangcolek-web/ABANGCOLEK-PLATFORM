$path = 'D:\ABANGCOLEK-PLATFORM\src\services\abangColekRepoData.ts'
$text = [IO.File]::ReadAllText($path)
function Replace-Block([string]$start, [string]$end, [string]$replacement) {
  $script:text = $script:text.Replace($start, "___START___")
  $a = $script:text.IndexOf("___START___")
  if ($a -lt 0) { throw "start marker not found: $start" }
  $b = $script:text.IndexOf($end, $a)
  if ($b -lt 0) { throw "end marker not found: $end" }
  $script:text = $script:text.Substring(0,$a) + $replacement + "`r`n`r`n" + $script:text.Substring($b)
}
$deck = @'
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
'@
Replace-Block '// 9. Official 15-Slide Investor & Brand Pitch Deck (From abang-colek-brand-os presetData)' '// 10. Official Brand Manifestos' ($deck + "`r`n// 10. Working principles derived from social evidence, not approved manifestos")
$manifestos = @'
export const BRAND_MANIFESTOS = [
  { id: "working-principle-1", title: "Observed principle: real people", text: "Public content repeatedly shows founder presence, customer reactions, event activity and product experiences. This is an observation, not a founder-approved manifesto." },
  { id: "working-principle-2", title: "Working principle: evidence before claim", text: "Use social content to understand identity and content patterns. Do not convert a post into price, SKU, stock, payment or ownership truth without a separate approved record." }
];

// 11. TikTok observed content patterns and draft guardrails
'@
Replace-Block '// 10. Official Brand Manifestos' '// 11. TikTok SOP Posting Cadence & Golden Rules' $manifestos
$cadence = @'
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

'@
Replace-Block 'export const TIKTOK_WEEKLY_CADENCE = [' '// 12. TikTok Profile Metrics' $cadence
$text = $text.Replace('TikTok: @styloairpool (75.2K Followers)\nInstagram: @abangcolek\nWhatsApp HQ: 6019-XXX-XXXX\nOperasi: Liurleleh House Malaysia', 'TikTok: @styloairpool (76.7K followers snapshot)\nInstagram: @airpoolstylo (22.8K followers snapshot)\nFacebook: /airpoolstylo (8.2K followers snapshot)\nThreads: @airpoolstylo (5,504 followers snapshot)\nAll metrics are dated snapshots, not historical analytics.')
[IO.File]::WriteAllText($path, $text, [Text.UTF8Encoding]::new($false))
Write-Output "Updated $path"
