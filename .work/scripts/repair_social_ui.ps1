$path = 'D:\ABANGCOLEK-PLATFORM\src\components\AbangColekDiscoveryView.tsx'
$text = [IO.File]::ReadAllText($path)
$nl = "`r`n"
$text = $text.Replace("} from '@/services/abangColekRepoData';", "} from '@/services/abangColekRepoData';$nl" + "import { SOCIAL_ACCOUNTS, OBSERVED_PRODUCT_SIGNALS, OBSERVED_CONTENT_PILLARS } from '@/data/abangcolekSocialSourceOfTruth';")
$oldMetrics = '(?s)            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">.*?            </div>\r?\n\r?\n            /\*\* Core Brand'
$newMetrics = @'
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--ui-soft)] border border-[var(--ui-border)] flex flex-col justify-between">
                <span className="text-[11px] font-bold text-[var(--ui-muted)] uppercase tracking-wider">Akaun Sosial</span>
                <div className="mt-2 flex items-baseline gap-1.5"><span className="text-2xl font-extrabold text-[var(--ui-text)]">{SOCIAL_ACCOUNTS.length}</span><span className="text-[10px] text-[var(--ui-success-text)] font-bold">OBSERVED</span></div>
                <span className="text-[10px] text-[var(--ui-muted)] mt-1">Snapshot {SOCIAL_ACCOUNTS[0].snapshotDate}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--ui-soft)] border border-[var(--ui-border)] flex flex-col justify-between">
                <span className="text-[11px] font-bold text-[var(--ui-muted)] uppercase tracking-wider">Signal Produk</span>
                <div className="mt-2 flex items-baseline gap-1.5"><span className="text-2xl font-extrabold text-[var(--ui-text)]">{OBSERVED_PRODUCT_SIGNALS.length}</span><span className="text-[10px] text-[var(--ui-warning-text)] font-bold">MAPPING NEEDED</span></div>
                <span className="text-[10px] text-[var(--ui-muted)] mt-1">Bukan katalog SKU/harga</span>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--ui-soft)] border border-[var(--ui-border)] flex flex-col justify-between">
                <span className="text-[11px] font-bold text-[var(--ui-muted)] uppercase tracking-wider">Content Pillars</span>
                <div className="mt-2 flex items-baseline gap-1.5"><span className="text-2xl font-extrabold text-[var(--ui-text)]">{OBSERVED_CONTENT_PILLARS.length}</span><span className="text-[10px] text-[var(--ui-success-text)] font-bold">OBSERVED</span></div>
                <span className="text-[10px] text-[var(--ui-muted)] mt-1">Daripada profil founder</span>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--ui-soft)] border border-[var(--ui-border)] flex flex-col justify-between">
                <span className="text-[11px] font-bold text-[var(--ui-muted)] uppercase tracking-wider">Data Operasi</span>
                <div className="mt-2 flex items-baseline gap-1.5"><span className="text-2xl font-extrabold text-[var(--ui-text)]">0</span><span className="text-[10px] text-[var(--ui-warning-text)] font-bold">NOT FROM SOCIAL</span></div>
                <span className="text-[10px] text-[var(--ui-muted)] mt-1">Harga, stok & order kekal unknown</span>
              </div>
            </div>

            {/* Core Brand
'@
$text = [regex]::Replace($text, $oldMetrics, $newMetrics, [Text.RegularExpressions.RegexOptions]::Singleline)
$text = $text.Replace('Disahkan Penuh', 'Social snapshot — evidence scoped')
$text = $text.Replace('Berdasarkan audit repositori, teras perniagaan berpusat kepada ', 'Berdasarkan snapshot sosial founder, kandungan yang kelihatan menunjukkan ')
$text = $text.Replace('<strong> ABANGCOLEK</strong> (produk kuah colek buah 500g, pencicah pedas manis, jeruk mangga asam boi) serta pasukan operasi ', '<strong> ABANG COLEK</strong> muncul bersama produk colek/jeruk, reaksi pelanggan, event dan kandungan founder. Ownership, SKU, harga dan stok tidak dipastikan daripada sosial. ')
$text = $text.Replace('<strong> STYLOAIRPOOL</strong> yang mengendalikan gerai pop-up bergerak di Toppen Johor Bahru, Pasar Karat, Shah Alam, dan Bangi.', '<strong> @styloairpool</strong> berfungsi sebagai identity/founder content signal. Lokasi, operasi dan authority memerlukan rekod dalaman berasingan.')
$text = $text.Replace('Jenama & Pengendali Rasmi', 'Founder/social signal — mapping pending')
$text = $text.Replace('Produk Rakan Niaga', 'Related entity — observed')
$text = $text.Replace('Produk Jeruk Buah', 'Related entity — observed')
$text = $text.Replace('Ejen Wilayah Pantai Timur', 'Unverified — removed from canonical social evidence')
$text = $text.Replace('Tiada Halusinasi', 'Evidence guardrails active')
$text = $text.Replace('Sistem mengekalkan piawaian etika data tanpa sebarang mock data:', 'Sistem kini membezakan social observation daripada data operasi; legacy mock/claim telah dikarantin:')
$text = $text.Replace('Aduan penutup botol kuah colek bocor semasa pos kurier dilabelkan sebagai <code>LEAKAGE</code>. Punca operasi wajib kekal <strong><code>UNDETERMINED</code></strong> sehingga semakan lot pengeluaran pembekal atau syarikat kurier diverifikasi.', 'Tiada aduan leakage diambil sebagai fakta daripada snapshot sosial. Sebarang case perlu datang daripada record customer/order sebenar dan kekal <strong><code>UNKNOWN</code></strong> sehingga evidence diterima.')
$text = $text.Replace('Lagu Tema Rasmi: &quot;Kasi Lagi-Lagi&quot;', 'Audio claim — belum disahkan')
$text = $text.Replace('Hip-Hop / Trap Anthem (85-95 BPM) · Abang Colek', 'Aset audio tidak dianggap official tanpa source dan rights evidence')
$text = $text.Replace('Audio Master 320kbps', 'PENDING_APPROVAL')
$text = $text.Replace('Kasi Lagi-Lagi (Theme Song)', 'Audio quarantined')
$text = $text.Replace('Lihat Lirik Penuh (Karaoke)', 'Lyrics unavailable — pending rights')
$text = $text.Replace('src="/audio/kasi-lagi-lagi.mp3"', 'src=""')
# Empty WhatsApp template guard: replace active template block with an evidence notice.
$oldWhats = '(?s)                        \{\(\(\) => \{\r?\n                          const activeT = WHATSAPP_TEMPLATES\.find\(t => t\.id === selectedTemplateId\) \|\| WHATSAPP_TEMPLATES\[0\];.*?                        \}\)\(\)\}'
$newWhats = @'
                        {WHATSAPP_TEMPLATES.length === 0 ? (
                          <div className="lg:col-span-2 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-sm text-[var(--ui-text)]">
                            <strong>Templat WhatsApp dikarantin.</strong>
                            <p className="mt-2 text-xs text-[var(--ui-muted)]">Harga, promosi, lokasi, bank details dan API delivery tidak disahkan melalui sosial founder. Tambah template hanya selepas founder meluluskan source, terms dan destination.</p>
                          </div>
                        ) : (() => {
                          const activeT = WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplateId) || WHATSAPP_TEMPLATES[0];
                          return <div className="lg:col-span-2 p-6 rounded-3xl bg-[var(--ui-surface)] border border-[var(--ui-border)]"><h5 className="font-bold text-sm">{activeT.name}</h5><p className="text-xs text-[var(--ui-muted)] mt-2 whitespace-pre-wrap">{activeT.message}</p></div>;
                        })()}
'@
$text = [regex]::Replace($text, $oldWhats, $newWhats, [Text.RegularExpressions.RegexOptions]::Singleline)
[IO.File]::WriteAllText($path, $text, [Text.UTF8Encoding]::new($false))
Write-Output "Updated $path"
