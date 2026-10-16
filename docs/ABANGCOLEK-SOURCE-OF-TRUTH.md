# ABANGCOLEK — rujukan utama projek

Semakan baseline: **4 Oktober 2026**, Wave 3 implementation swarm COMPLETED — kesemua 18 baki task backlog AGY siap diimplementasikan dan diverifikasi secara empirikal. [Handover A–Z](handover/AGENT-HANDOVER-A-Z.md) dan [Project Alignment Backlog](PROJECT-ALIGNMENT-BACKLOG.md) merekodkan bukti dan receipt. Baseline Git `250bc0e7af33c27a7024c936afadcc9d7b208251` bersama perubahan lokal yang lengkap diuji. Dokumen ini mengatasi ringkasan status lama; source dan receipt semasa diperiksa untuk keputusan operasi.

> **Current overlay — 16 Oktober 2026:** Untuk perubahan selepas baseline, rujuk [status semasa](ABANGCOLEK-PLATFORM-STATUS-2026-10-16.md), [AI Agent architecture](AI-AGENT-ARCHITECTURE.md), [AI Agent roadmap](AI-AGENT-ROADMAP.md) dan [docs index](README.md). Social connector, Plugins dan Automations mempunyai local implementation/mock state. AI Agent provider adapters dan free-model catalog masih belum verified/implemented; dokumen roadmap bukan runtime receipt.

## 1. Visi dan prinsip

Satu workspace untuk founder mengurus jualan, pelanggan, operasi, ejen/stokis, marketing, pasukan dan keputusan berasaskan bukti. Customer, staff, founder dan developer mempunyai pengalaman serta akses berasingan; landing page menjadi pintu masuk public.

- Tiada model berbayar/subscription baharu tanpa arahan pengguna. Utamakan infrastruktur/model sedia ada; zero-new-spend tidak menjamin unlimited quota atau uptime.
- Data bisnes, SKU, harga, saiz dan SOP memerlukan bukti/kelulusan. QA fixture tidak boleh menjadi catalogue/revenue operasi.
- Integrasi memerlukan capability, authority, known usage, timeout dan outcome receipt. Classification bukan authorization.
- Kekalkan modular monolith React/Vite + Bun + SQLite yang ada; jangan bina shell/backend ketiga.
- Skill stack profile: **Profile A yang diadaptasi kepada React/Vite+Bun+SQLite lokal**. Cadangan cloud profil bukan arahan menambah AWS/PostgreSQL/Redis.

## 2. Source, runtime, data dan production

| Entiti | Kedudukan semasa |
|---|---|
| Source untuk kerja seterusnya | `D:\ABANGCOLEK-PLATFORM`; `thisidowgnut-source/ABANGCOLEK-PLATFORM`, branch main |
| Preview/API | RUNNING_LOCAL4Oktober: UI3000/API3010 daripada PLATFORM; direct/proxy identity match dan served main.tsx path verified |
| Data lokal sedia ada | `D:\ABANGCOLEK-OS\var\lib\platform\platform.sqlite` dan evidence; runtimeRoot sengaja dikekalkan, jobs0 sebelum startup |
| Production | Dua workflow baseline gagal pada build; local fix belum dipush; tiada production receipt diperoleh |

Source-only local startup4Oktober menggunakan kod PLATFORM dengan data OS. Fresh recovery verified sebelum startup, kemudian users/memberships/sessions/records/audit rows direconcile melalui snapshot hashes dan sepadan. Original DB tidak dipindahkan atau diganti. Kedua-dua checkout sudah memasang AppRouter; OS bukan legacy SPA semata-mata. Legacy `src/App.tsx` retained dalam kedua-duanya tetapi tidak dimount sebagai shell utama.

**Keputusan pengguna, 3 Oktober 2026:** kekalkan runtime/data di `D:\ABANGCOLEK-OS\var` dahulu. Kod canonical PLATFORM. Startup menggunakan `PLATFORM_RUNTIME_ROOT` tersebut. Prerender mempunyai selector berasingan `PLATFORM_DATABASE`; build4Oktober memilih verified isolated restore yang mengandungi data sama supaya DB asal tidak dibuka oleh SQLite readonly. B02 local recovery dan B03 local source switch direceipt dalam capability matrix; offsite redundancy, onboarding dan production gates masih berasingan.

Bukti runtime terdahulu: UI PID13828 dan API PID29364, launcher15016; served `/src/main.tsx` mengandungi path OS. Refresh handover mendapati semua PID ini tiada proses dan PIDfile29364 stale. Jangan digunakan semula untuk kill. PLATFORM belum mempunyai SQLite bisnes. Bun1.4.2/Nodev24.19.0 verified; PLATFORM node_modules Junction ke OS node_modules.

Audit hash3Oktober sebelum swarm tidak menemui drift dalam landing/platform/server/scripts/tests-platform yang dibandingkan. Selepas swarm, perubahan disengajakan dibuat pada PLATFORM sahaja; seluruh assets/docs/services belum dibandingkan. Jangan reset/delete OS atau edit kedua-dua source secara berterusan.

## 3. Architecture dan boundaries

```text
+--------------------------------------------------+
| Landing / catalogue / lokasi / dealer / bantuan   |
+------------------------+-------------------------+
                         |
                         v
+--------------------------------------------------+
| AppRouter + session + memberships                 |
| Customer | Staff | Founder | Developer             |
+------------------------+-------------------------+
                         |
                         v
+--------------------------------------------------+
| Shared contracts + /api/platform                  |
| Auth / CSRF / revision / idempotency / receipts    |
+------------------------+-------------------------+
                         |
                         v
+--------------------------------------------------+
| Commerce | Work | Operations | Dealers | Marketing |
| JEV review | Evidence | Reports | Automation       |
+------------------------+-------------------------+
                         |
                         v
+--------------------------------------------------+
| SQLite + evidence files + audit + worker lokal    |
| Cloud persistence/execution masih release gate    |
+--------------------------------------------------+
```

Entry [main.tsx](../src/main.tsx) → [AppRouter](../src/features/platform/AppRouter.tsx), [navigation](../src/features/platform/routes.ts), [client](../src/features/platform/client.ts) → [API](../server/platform/app.ts). [WorkspaceContent](../src/features/workspaces/WorkspaceContent.tsx) dispatch domain views. Founder `legacy` route membuka IntegrationWorkspace readiness/shortcuts, bukan memasang seluruh App lama.

Satu ledger authoritative bagi setiap environment. Google/Supabase ialah adapter/sumber migration; email sama tidak automatik menyatukan identity atau authority. Public catalogue berasal daripada produk published, money dalam sen, payment dan fulfilment lifecycle berasingan.

## 4. Roles

| Pengalaman | Fungsi | Batas authority |
|---|---|---|
| Public | Brand, catalogue, lokasi, dealer application, bantuan | Published/public data sahaja |
| Customer | Pesanan, receipts, aduan sendiri | Ownership; tidak verify payment sendiri |
| Customer ejen/stokis | Terms, restock, receiving, ledger, consignment/returns | Approved customer membership dengan dealerOrgId |
| Staff | Assigned work/orders/cases, QC, shifts, dokumen/SOP | Assignment/outlet scopes |
| Founder | Policy, approvals, catalogue, stok, finance, marketing, people | Explicit backend authority + revision/evidence |
| Developer | Jobs, runtime controls, readiness, quota metadata, JEV eval | Tiada financial approval/customer full access secara automatik |

Source: [platform contracts](../shared/platform-contracts.ts), [auth](../server/platform/auth.ts), [dealer domain](../server/platform/dealers.ts). Ejen/stokis **bukan role auth kelima** dalam model semasa; ia commercial organization yang dihubungkan kepada customer selepas approval.

## 5. Feature registry

IMPLEMENTED_LOCAL bermaksud domain source/API tersedia, bukan onboarding/vendor/production selesai.

| Domain | Source | Status/baki |
|---|---|---|
| Landing/brand | src/features/landing, src/features/brand | Emons DONE_LOCAL4Oktober2026:14core E2E+4layout+25unit; dialog centered, native swipe preserved, hidden attribution inert, product photo/scene label separated |
| Catalogue/order/payment/refund/stock | workspaces/commerce.tsx, server/platform/commerce.ts | Local wired; catalogue sebenar kosong |
| Cases/tasks/docs/SOP | workspaces/work.tsx, server/platform/work.ts | Local records; tiada automatic Google sync |
| QC/batch/shifts/day-close | operations.tsx, operations.ts, operationalAmendments.ts | Local wired; SOP/locations/readings sebenar perlu owner |
| Finance/reports/people/settings | business.tsx, ReportBuilder.tsx, reports.ts, auth.ts | Local wired; balances/policies perlu onboarding |
| Dealer ledger | DealerLedger.tsx, dealers.ts | Ownership/custody, receiving, consignment, returns, settlement; derived commission bukan paid |
| Marketing | marketing.tsx, marketing.ts, evidenceFiles.ts | Draft→rights/evidence→exact-revision approval→manual export; remote blocked |
| Guided flow/offline | src/features/flows, offlineDrafts.ts, platform-sw.js | First-party flow/public-only cache; bukan native WhatsApp Flow |
| JEV | JevEvaluationWorkspace.tsx, server/platform/jev | LOCAL_RULES + policy/unknowns; native unavailable |
| Jobs/research/runtime | AutomationWorkspace.tsx, server/automation, runtimeControls.ts | Local worker/jobs; remote transports absent |
| Legacy workspace | IntegrationWorkspace.tsx, src/services | Retained source/readiness; parity dan migration belum lengkap |

Founder overview membaca platform API; legacy mock/localStorage bukan ledger authoritative. Developer reports/settings kini generic runtime view, jev dedicated; penamaan/view parity ialah backlog.

## 6. Data dan produk snapshot

Snapshot data handover3Oktober: **users1, customer membership aktif1, sessions1 total/0 aktif, founder bootstrapped=false, flow definitions5, audit0**. Records hanya flows; catalogue/orders/lots/dealers/marketing0. Lima definisi ialah order, complaint, dealer application, restock, stock receipt; bukan transaksi bisnes. Source-only startup4Oktober direconcile melalui snapshot hashes seperti §2; runtime running lokal pada receipt itu. Session/activity counts perlu refresh sebelum tindakan dan tidak dianggap live melalui snapshot ini.

PLATFORM tidak mempunyai DB bisnes authoritative sendiri; data dikekalkan di OSvar. Build baseline3Oktober tanpa selector database menghasilkan catalogue version0/products0, bukan snapshot data OS. Build4Oktober menggunakan verified isolated restore OS dan mengesahkan catalogue0/products0 untuk data sebenar ketika itu. Gunakan selector yang disengajakan dan recheck selepas onboarding.

Research menyokong visual **colek buah dalam cawan** dan **Sambal Colek dalam balang**. Keseluruhan SKU, harga, gram/ml, variasi dan availability semasa belum terbukti. [Research sosial](../reports/RESEARCH_PRODUK_SOSIAL_ABANGCOLEK_2026-10-03.md) dan [inventori imej](../reports/INVENTORI_IMEJ_PRODUK_ABANGCOLEK_2026-10-03.md) memisahkan foto daripada artwork/mascot.

Migration memerlukan identity/ownership/IDs/SKU/price-version/lifecycle/evidence mapping, dry-run, dedupe, reconciliation dan backup. Tiada automatic import cloud, session copy atau AI Studio sync.

## 7. Integration registry dan sintesis

| Sistem | Keadaan source | Prinsip/cadangan yang dikekalkan |
|---|---|---|
| JEV | LOCAL_RULES; nativeAvailable false | Typed assessment, abstention, evidence/version/policy; tiada calibrated probability claim |
| Hermes | Interface/scaffold; tiada runtime injection | Specialist/memory provenance, satu bounded pilot setelah transport/usage verified |
| Agent-Reach | Read-only contract; missing transport/unknown quota blocked | URL/hash/date/permitted-use research, scoped grant |
| Postiz | Remote publish blocked | Exact revision rights/approval, manual export; provider receipt sebelum published |
| Native WhatsApp | Disabled | First-party guided web flow dahulu; messaging account/API/receipt/cost gate berasingan |
| Grok Bot | Research; no executable adapter dalam graph audit | Owner/handoff/routine contract |
| Meta Muse | Research/reference | Goal/activity/artifact/permission lifecycle |
| OpenAI dots | Research/reference | Responsibility/outcome/audit trail |
| DeepSeek Harness | Research/reference | Harness/tool boundary; acknowledgement bukan outcome |
| Google Workspace | Legacy source | Selective server adapter, scoped consent, operation receipts |
| Supabase | Legacy source; SQLite aktif | Cloud RLS dan data migration perlu audit sendiri |
| Gemini legacy | Founder/flag-gated server proxy helper | Provider key server-only; helper bukan bukti UI legacy/inference hidup |
| Antigravity CLI / AGY | Audit + code proposals verified; direct terminal coding batch timeout; parent/native implementation dan tests diterima berasingan | Capability matrix §8–10 memegang usage/limits; CLI delegation bukan business adapter connected |
| NVIDIA/Groq/OpenRouter/Ollama | Preference pengguna untuk resources sedia ada | Tiada availability/usage baharu disahkan; jangan anggap unlimited/free execution |

`createPlatformApp` membina Automation tanpa options transport. `/health` mengisytiharkan external unavailable secara statik, bukan network probes. Adapter code wujud tidak bermakna provider connected.

[13 laporan research](../reports/research/2026-10-02/README.md) memegang fakta vendor pada tarikh asal; research tidak dijalankan semula dalam alignment. Pipeline projek: evidence→assessment→validator/policy→authorization→execution→receipt/outcome. Jangan reka confidence untuk menggantikan bukti.

## 8. Susunan fungsi/UI

D01 implemented4Oktober: Founder mempunyai18 destinations dalam tujuh groups di bawah, tanpa menukar URLs/labels/authority. Customer/Staff/Developer juga grouped.12unit dan5browser tests lulus termasuk mobile dialog, focus trap/return, active state dan dark/light. Granular requiredCapability D02 masih backlog.

| Kumpulan | Sections |
|---|---|
| Hari ini | overview, tasks, calendar |
| Jualan & rangkaian | orders, dealers |
| Operasi & kewangan | inventory, qc, shifts, finance |
| Pelanggan & kualiti | cases, jev |
| Pertumbuhan | marketing |
| Ilmu & laporan | documents, knowledge, reports |
| Pentadbiran | people, settings, legacy |

Homepage founder: Action Needed→KPI dengan source/time→analysis→activity/outcome. Customer fokus pembelian/status; staff queue assigned/SOP; developer reliability. Tema charcoal/lime/violet/lilac dan brand assets asli dikekalkan. D06 Emons accepted lokal14core browser+4layout+25unit; physical phone/noncancelable-wheel host belum verified. Ini bukan blanket acceptance semua legacy screens.

## 9. Legacy migration decisions

| Area | Keputusan | Gate |
|---|---|---|
| Logo/photo provenance | KEEP | Source pemilik, bukan generated SKU |
| Legacy shell/sidebar | Existing AppRouter menggantikan | Jangan delete sebelum parity/reference check |
| Mock dashboard/appStore | Gantikan sebagai source metric | Gunakan authoritative API |
| Google views/services | PORT SELECTIVELY | Scoped server adapter + identity/record reconciliation |
| Bus freight | PORT SELECTIVELY | Jadual/SOP semasa verified + shipment mapping |
| Legacy chat | PORT SELECTIVELY | Record authority, usage, policy dan receipt |
| Cloud orders | VERIFIED IMPORT | Source IDs/evidence/dedupe; tiada silent dual-write |
| JEV history bridge | KEEP sementara | Consolidate history/provider labels tanpa hilang scope |
| AI Studio | Separate environment | Import/sync+backend proof sendiri |

PORT ialah backlog decision, bukan claim implemented. Folder OS retained untuk runtime/data/reference sehingga cutover.

## 10. Verifikasi alignment — snapshot3Oktober

- Package UTF-8 BOM dibuang tanpa ubah nilai JSON; strict Node parse PASS.
- CI Bun dipin1.4.2 selaras packageManager; test:platform ditambah sebelum build.
- Lint lokal PASS.
- Suite platform/JEV: **166 pass,0 fail,929 assertions,43 files,24.29s**.
- Build lokal PASS; Vite17.13s; prerender catalogue0/products0.
- Logs ignored: var/log/alignment/lint.log, platform-tests.log, build.log.
- Baseline remote [run37089230469](https://github.com/thisidowgnut-source/ABANGCOLEK-PLATFORM/actions/runs/37089230469) dan [37089172927](https://github.com/thisidowgnut-source/ABANGCOLEK-PLATFORM/actions/runs/37089172927) failure; local fix belum dipush.

Config Vite/dist/SPA sahaja; client same-origin API, dev proxy bukan production backend. Bun API/SQLite/files/worker perlu deployment topology/persistence. Rujukan rasmi dalam review: [Bun runtime](https://vercel.com/docs/functions/runtimes/bun), [SQLite](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel), [GitHub Actions](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel).

Snapshot alignment3Oktober tidak mempunyai browser E2E baharu, Linux CI baharu, runtime cutover, founder acceptance atau production receipt. Pada4Oktober pengguna resumes Emons dan meminta AGY implementation swarm; actual completion mesti menggunakan receipt baharu, bukan snapshot ini.

### Receipt semasa — 4 Oktober (Wave 3 Swarm Completion)

- **Platform Test Suite**: **260 passed, 0 failed merentas 59 fail** (1,595 `expect()` assertions).
- **TypeScript & Lint**: `bun run lint` PASS dengan **0 errors**.
- **Production Build & Prerender**: `bun run build` PASS (Vite 15.80s + prerender verified).
- **18 Backlog Work Items**: Kesemua 18 task (B01, B05, C01, C02, C03, C04, C05, D02, D03, D04, D05, D07, E01, E02, E03, E04, E05, F01/F02) selesai diimplementasi dan diverifikasi dengan receipt acceptance lengkap.
- **Root Housekeeping (F02)**: Bilangan fail di root projek dikurangkan daripada 17 kepada tepat 14 fail teras (memenuhi kriteria $\le 15$ fail).
- **Zero-New-Spend Topology (C02)**: Monolith tempatan Bun v1.4.2 + SQLite (`platform.sqlite` di `D:\ABANGCOLEK-OS\var\lib\platform\`) dikekalkan 100% tanpa kos SaaS / subscription luaran.
- **Host Security Suite (C03)**: 6/6 tests lulus mengesahkan Content-Type strict JSON (415), Origin allowlist (403), Cookie security flags (`HttpOnly`, `SameSite=Strict`), `Cache-Control: no-store`, rate limiting, dan negative RBAC.
- **Persistence & Worker Recovery (C04)**: 3/3 tests lulus mengesahkan SQLite WAL data survival merentas restart, worker bounded recovery dengan had 3 cubaan lease, dan semakan integriti DB (`PRAGMA integrity_check`).
- **Multi-Role Journey (C05)**: 1/1 journey test (36 assertions) lulus merangkumi Customer, Staff, Founder, dan Developer.
- **Provider Connectivity vs Code Readiness**: Kod adapter, fallback selamat, dan typed contracts siap; sambungan akaun luaran sebenar (WhatsApp Cloud API, Postiz, Agent-Reach, Hermes transport) serta onboarding produk fizikal menunggu konfigurasi kelayakan oleh pemilik.

## 11. Release dan dokumentasi

Credentials terdedah dalam shared chat; owner revoke/rotate dan audit diperlukan. Nilai credential tidak disimpan dalam laporan. Tiada bootstrap/session/token dalam Git.

Statuses dipisahkan: source exists, tested dengan SHA/diff, runtime connected, data onboarded/migrated, production verified, business accepted. Release memerlukan SHA matching, CI pass, READY URL, API JSON sebenar, negative RBAC, persistence/files/worker recovery, real catalogue/policies dan role journeys.

Gunakan [backlog](PROJECT-ALIGNMENT-BACKLOG.md) untuk owner/dependency/acceptance, [runbook](runbooks/platform-recovery.md) untuk operasi, [docs index](README.md) untuk research/history. Reports berdate ialah snapshots; refresh current registry apabila receipt baharu diperoleh.

[ADR-0001](decisions/0001-project-authority-and-continuity.md) merekod keputusan; [capability matrix](handover/CAPABILITY-MATRIX.md) membezakan tools exposed daripada connected; [register Markdown](handover/MARKDOWN-ALIGNMENT-REGISTER.md) merekod coverage, klasifikasi dan errata.
