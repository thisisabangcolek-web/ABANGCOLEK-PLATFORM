# ABANGCOLEK PLATFORM

Ruang kerja operasi ABANGCOLEK untuk customer, staff, founder dan developer, termasuk landing page, ejen/stokis, commerce, quality, marketing, evidence dan automation lokal.

**Mula di [handover A–Z](docs/handover/AGENT-HANDOVER-A-Z.md)** → [Source of Truth](docs/ABANGCOLEK-SOURCE-OF-TRUTH.md) → [status 16 Oktober](docs/ABANGCOLEK-PLATFORM-STATUS-2026-10-16.md) → [AI Agent architecture](docs/AI-AGENT-ARCHITECTURE.md) → [indeks dokumentasi](docs/README.md).

> **Current update — 16 Oktober 2026:** Social/Plugins/Automation sudah mempunyai local implementation dan mock Threads + YouTube state. AI Agent multi-role, provider adapters dan free-model catalog masih pada design/research track; jangan baca roadmap sebagai production receipt.

## Keadaan semasa — baseline 4 Oktober 2026

| Area | Status |
|---|---|
| Source/repo untuk kerja seterusnya | D:\ABANGCOLEK-PLATFORM; thisidowgnut-source/ABANGCOLEK-PLATFORM |
| Preview/API | RUNNING_LOCAL: UI3000/API3010 daripada PLATFORM; identity direct/proxy dan served main.tsx verified4Oktober |
| Data lokal sedia ada | D:\ABANGCOLEK-OS\var\lib\platform\platform.sqlite; retained, fresh recovery dan pre/post business-row hashes sepadan |
| Engineering core | React/Vite + AppRouter + Bun API + SQLite; authority backend |
| Onboarding snapshot | Founder belum provisioned; 0 published products |
| JEV | LOCAL_RULES/evidence/policy; native TypeSafe belum connected |
| Hermes / Agent-Reach | Adapter contracts; tiada runtime transport |
| Marketing | Draft/rights/approval/manual export; Postiz remote publish blocked |
| WhatsApp | Guided web flows; native integration disabled |
| Google/Supabase | Legacy source; tidak automatik synced/migrated |
| Production | Local encoding fix belum dipush; API/data/worker gates terbuka |
| Hero Emons | DONE_LOCAL4Oktober2026:14core E2E+4layout cases,25scene unit; [swarm receipt](docs/handover/CAPABILITY-MATRIX.md) §10 |

Tiada claim native latency/calibrated confidence/universal SLA atau semua vendor aktif. [13 laporan research](reports/research/2026-10-02/README.md) merangkumi Grok, Muse, dots, DeepSeek, Hermes dan domain bisnes.

## Pengalaman pengguna

- Public: landing, catalogue, lokasi, permohonan dealer dan bantuan.
- Customer: purchases/status/private receipts/complaints, dealer business scope jika diluluskan.
- Staff: assigned orders/tasks/cases, QC, shift, dokumen dan SOP.
- Founder: overview, approvals, stock/batch, dealers, marketing, finance, people dan settings.
- Developer: readiness/jobs/runtime/evaluation; tiada financial authority secara automatik.

Dealer/stokis ialah approved organization linked kepada customer membership, bukan role auth kelima. Commands melalui session/membership, scoped access, revision/evidence dan receipt.

## Architecture

```text
+-------------------------------------------+
| Landing + AppRouter + role workspaces     |
+---------------------+---------------------+
                      |
                      v
+-------------------------------------------+
| /api/platform + shared typed contracts    |
| Auth / CSRF / revision / idempotency       |
+---------------------+---------------------+
                      |
                      v
+-------------------------------------------+
| Bun domain modules + SQLite + files       |
| Evidence / JEV review / local job worker   |
+-------------------------------------------+
```

src/main.tsx mounts AppRouter. Legacy src/App.tsx retained; founder integration page tidak memount seluruh legacy shell. First-party documents/tasks/calendar bukan Google records automatik.

## Development dan verifikasi

Pilih runtime/persistence root dengan sengaja. **Jangan menjalankan launcher kedua pada port sedia ada atau memulakan PLATFORM dengan DB kosong lalu menganggap data OS hilang.** Source kini PLATFORM dengan runtimeRoot OS var; refresh listener sebelum startup. B04 launcher menyemak identity checkout/runtime/database dan menolak listener yang tidak boleh disahkan. Startup/recovery menggunakan [runbook](docs/runbooks/platform-recovery.md).

Toolchain Bun **1.4.2**, sepadan packageManager. Dependencies tersedia pada mesin ini; installation diperlukan hanya bagi environment baharu.

```powershell
Set-Location -LiteralPath 'D:\ABANGCOLEK-PLATFORM'
bun run lint
bun run test:platform
bun run build
```

Build membaca PLATFORM_DATABASE atau default DB checkout; jika DB tiada, public catalogue kosong. Jangan ship snapshot kosong sebagai bukti catalogue bisnes sudah onboarded.

Swarm4Oktober: lint PASS; **210 tests PASS,0 fail,1199 assertions/47 files**; final build PASS8.27s. Emons14core+4layout, navigation5 dan dealer1 browser cases lulus merentas scoped QA runs; real-runtime6smoke PASS. Build menggunakan verified isolated restore bagi mengelakkan membuka DB asal; published catalogue0 ialah keadaan sebenar. Logs `var/log/implementation-final`; tiada remote CI/production acceptance baharu.

## Struktur

```text
src/features/   platform, landing, workspaces, flows, brand
server/         API, domain modules, JEV, automation, runtime
shared/         typed contracts/status schemas
public/         verified assets, manifest/public-only worker
tests/          JEV/platform/integration/browser journeys
scripts/        dev/prerender/QA/backup/build helpers
docs/           current registry/backlog/runbooks/plans
reports/        dated research/audit/implementation evidence
skills/         engineering workflow guidance
var/            ignored logs/runtime/database/files
```

## Deployment

GitHub workflow menjalankan install/lint/platform tests/build sebelum Vercel deploy. Config semasa menerbitkan Vite frontend; API/persistence/worker perlu topology dan proof sendiri.

Credentials tidak diletakkan dalam chat/Git/docs. Known usage, rights, approval dan zero-new-spend perlu disahkan sebelum external execution. [Backlog B/C](docs/PROJECT-ALIGNMENT-BACKLOG.md) memetakan cutover, credential handling dan release gates.
