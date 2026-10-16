$path = 'D:\ABANGCOLEK-PLATFORM\src\services\abangColekRepoData.ts'
$text = [IO.File]::ReadAllText($path)
$nl = "`r`n"
function Replace-Once([string]$pattern, [string]$replacement) {
  $script:text = [regex]::Replace($script:text, $pattern, $replacement, [Text.RegularExpressions.RegexOptions]::Singleline)
}
Replace-Once '// 1\. TikTok Viral Hooks Bank.*?// 2\. Motivational Quotes Bank' ('// 1. TikTok Viral Hooks Bank' + $nl + '// QUARANTINED: tiada hook per-video dan metrik yang disahkan dalam snapshot sosial.' + $nl + 'export const TIKTOK_VIRAL_HOOKS: TikTokViralHook[] = [];' + $nl + $nl + '// 2. Motivational Quotes Bank')
Replace-Once 'export const MOTIVATIONAL_QUOTES: MotivationalQuote\[\] = \[.*?\];\r?\n\r?\n// 3\. Taglines' ('export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [' + $nl + '  { id: "social-pending-1", quote: "Tiada petikan founder yang disahkan secara post-level dalam snapshot ini.", author: "Status: PENDING_FOUNDER_APPROVAL", category: "founder" }' + $nl + '];' + $nl + $nl + '// 3. Taglines')
Replace-Once 'export const BRAND_TAGLINES: BrandTagline\[\] = \[.*?\];\r?\n\r?\n// 4\. Booth Ops Checklists' ('export const BRAND_TAGLINES: BrandTagline[] = [' + $nl + '  { id: "social-tagline-1", text: "PEDAS MANIS LIKAT MELEKAT", context: "social", emoji: "🌶️🥭" },' + $nl + '  { id: "social-tagline-2", text: "Rasa Sekali Jatuh Cinta Selamanya", context: "emotional", emoji: "❤️" },' + $nl + '  { id: "social-tagline-3", text: "AN INDESCRIBABLE SENSATION", context: "social", emoji: "" }' + $nl + '];' + $nl + $nl + '// 4. Booth Ops Checklists')
Replace-Once 'export const WHATSAPP_TEMPLATES: WhatsAppTemplate\[\] = \[.*?\];\r?\n\r?\n// 6\. Official Audio Anthem Metadata' ('// QUARANTINED: harga, promosi, lokasi, bank details dan WhatsApp API tidak terbukti melalui audit sosial.' + $nl + 'export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [];' + $nl + $nl + '// 6. Official Audio Anthem Metadata')
Replace-Once 'export const OFFICIAL_AUDIO_IDENTITY = \{.*?\};\r?\n\r?\n// 7\. WOCS Command Parser' ('// QUARANTINED: audio identity belum disahkan sebagai aset rasmi melalui source/rights evidence.' + $nl + 'export const OFFICIAL_AUDIO_IDENTITY = null;' + $nl + $nl + '// 7. WOCS Command Parser')
$text = $text.Replace('followers: "75.2K",', 'followers: "76.7K",').Replace('likes: "793.2K",', 'likes: "827.4K",').Replace('likesPerFollower: "10.5x (Super High Engagement)",', 'likesPerFollower: "UNKNOWN — derived ratio not stored as evidence",').Replace('founderName: "Megat Shaifulreza (Epull)",', 'founderName: "UNKNOWN — founder name observed on Facebook, not normalized here",')
[IO.File]::WriteAllText($path, $text, [Text.UTF8Encoding]::new($false))
Write-Output "Updated $path"
