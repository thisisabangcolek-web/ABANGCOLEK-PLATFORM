from pathlib import Path
import re

path = Path(r'D:\ABANGCOLEK-PLATFORM\src\services\abangColekRepoData.ts')
text = path.read_text(encoding='utf-8')

def replace(pattern: str, replacement: str):
    global text
    text, n = re.subn(pattern, replacement, text, flags=re.S)
    if n != 1:
        raise RuntimeError(f'Expected one replacement, got {n}: {pattern[:80]}')

replace(r'// 1\. TikTok Viral Hooks Bank.*?// 2\. Motivational Quotes Bank', '''// 1. TikTok Viral Hooks Bank
// QUARANTINED: tiada hook per-video dan metrik yang disahkan dalam snapshot sosial.
export const TIKTOK_VIRAL_HOOKS: TikTokViralHook[] = [];

// 2. Motivational Quotes Bank''')
replace(r'export const MOTIVATIONAL_QUOTES: MotivationalQuote\[\] = \[.*?\];\n\n// 3\. Taglines', '''export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  { id: "social-pending-1", quote: "Tiada petikan founder yang disahkan secara post-level dalam snapshot ini.", author: "Status: PENDING_FOUNDER_APPROVAL", category: "founder" }
];

// 3. Taglines''')
replace(r'export const BRAND_TAGLINES: BrandTagline\[\] = \[.*?\];\n\n// 4\. Booth Ops Checklists', '''export const BRAND_TAGLINES: BrandTagline[] = [
  { id: "social-tagline-1", text: "PEDAS MANIS LIKAT MELEKAT", context: "social", emoji: "🌶️🥭" },
  { id: "social-tagline-2", text: "Rasa Sekali Jatuh Cinta Selamanya", context: "emotional", emoji: "❤️" },
  { id: "social-tagline-3", text: "AN INDESCRIBABLE SENSATION", context: "social", emoji: "" }
];

// 4. Booth Ops Checklists''')
replace(r'export const WHATSAPP_TEMPLATES: WhatsAppTemplate\[\] = \[.*?\];\n\n// 6\. Official Audio Anthem Metadata', '''// QUARANTINED: harga, promosi, lokasi, bank details dan WhatsApp API tidak terbukti melalui audit sosial.
export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [];

// 6. Official Audio Anthem Metadata''')
replace(r'export const OFFICIAL_AUDIO_IDENTITY = \{.*?\};\n\n// 7\. WOCS Command Parser', '''// QUARANTINED: audio identity belum disahkan sebagai aset rasmi melalui source/rights evidence.
export const OFFICIAL_AUDIO_IDENTITY = null;

// 7. WOCS Command Parser''')
text = text.replace('followers: "75.2K",\n  likes: "793.2K",\n  likesPerFollower: "10.5x (Super High Engagement)",', 'followers: "76.7K",\n  likes: "827.4K",\n  likesPerFollower: "UNKNOWN — derived ratio not stored as evidence",')
text = text.replace('founderName: "Megat Shaifulreza (Epull)",', 'founderName: "UNKNOWN — founder name observed on Facebook, not normalized here",')
text = text.replace('bio: "Founder | Motivator 📈\\nPEDAS MANIS LIKAT MELEKAT 🌶️🥭\\n\\"Rasa Sekali Jatuh Cinta Selamanya\\"",', 'bio: "Founder | Motivator\\nPEDAS MANIS LIKAT MELEKAT\\nRasa Sekali Jatuh Cinta Selamanya",')
path.write_text(text, encoding='utf-8')
print(f'Updated {path}')
