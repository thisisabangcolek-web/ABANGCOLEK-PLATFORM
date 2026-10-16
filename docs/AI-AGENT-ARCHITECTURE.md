# ABANGCOLEK AI Agent — architecture dan access model

**Status:** DESIGN BASELINE — belum claim runtime/provider connected.
**Last reviewed:** 16 Oktober 2026.
**Authority:** Dokumen ini menerangkan reka bentuk yang akan dibina. Status sebenar mesti disahkan melalui Source of Truth, test dan runtime receipt.

## Matlamat

Satu conversational AI Agent yang boleh membantu **Founder, Developer, Staff/Agent dan Customer** melalui pengalaman mobile-first. Agent menggunakan provider yang boleh ditukar tanpa mengubah UI atau domain rules.

Agent bukan role auth baharu. Ia berjalan sebagai capability layer di atas session dan membership pengguna semasa.

## Model keselamatan

Permintaan agent melalui pipeline berikut:

```text
User session
  -> role + workspace + tenant scope
  -> intent + risk classification
  -> capability/tool allowlist
  -> read preview atau approval gate
  -> execution adapter
  -> receipt + audit + undo/rollback jika tersedia
```

"Access ke seluruh apps" bermaksud **agent boleh melihat katalog tools yang tersedia**, bukan bypass authorization. Setiap tool masih memerlukan:

- role dan workspace scope;
- capability yang diberikan;
- entity ownership atau business scope;
- revision/idempotency untuk mutation;
- approval untuk publish, delete, payment, credential, permission dan external message;
- audit receipt yang menyatakan apa, bila, oleh siapa dan provider mana.

Agent tidak boleh meminta atau menyimpan password pengguna. API key/BYOK disimpan server-side sebagai secret reference dan tidak dipulangkan ke model atau client.

## Role packs

| Role | Fokus | Default access |
|---|---|---|
| Founder | KPI, marketing, approval, stock, finance, team, automation | Read semua workspace scoped; mutation berisiko perlu approval |
| Developer | health, jobs, logs, contracts, test/build, runtime diagnostics | Developer tools; tiada financial/customer authority automatik |
| Staff/Agent | assigned work, order, QC, dealer, SOP, shipment | Assigned records dan organization scope sahaja |
| Customer | product discovery, order status, receipt, complaint, FAQ | Own records dan public published data |

Role pack ialah konfigurasi policy, bukan prompt sahaja. Prompt tidak boleh menaikkan permission.

## Provider abstraction

UI bercakap dengan `AgentRuntime`, bukan terus dengan vendor. Provider adapter minimum:

```text
ProviderRegistry
  - BYOK OpenAI-compatible
  - OpenRouter
  - NVIDIA NIM
  - OpenCode Zen
  - Ollama local
  - Manus/built-in fallback jika diaktifkan oleh deployment
```

Setiap adapter mendedahkan capability metadata:

- chat dan streaming;
- tool/function calling;
- JSON/schema output;
- vision atau multimodal;
- context window;
- cost/free label dan quota evidence;
- health check tanpa membocorkan key.

Free model bermaksud **tiada caj token pada route/provider yang dinyatakan**, bukan jaminan unlimited, uptime atau zero hardware cost. Catalog provider perlu menyimpan `verifiedAt`, source URL, quota note dan status `verified | stale | unknown`.

## CRUD domain

Founder boleh mengurus:

- provider connection metadata dan secret reference;
- model catalog dan preferred model per role;
- agent profile, system instruction, tool allowlist dan fallback chain;
- conversation, message, attachment reference dan archive;
- automation recipe dan schedule;
- approval policy dan execution receipt.

Delete ialah soft-delete/archive secara default. Credential revoke dan destructive deletion memerlukan confirmation serta audit.

## Mobile-first UI

UI utama ialah satu column pada phone dengan bottom navigation dan quick composer. Tablet/iPad menggunakan two-pane layout; laptop/PC menggunakan sidebar + conversation/workspace split.

Keperluan minimum:

- touch target sekurang-kurangnya 44px;
- composer melekat di bawah safe-area;
- provider/model switcher boleh dicapai dengan satu tangan;
- tool call dipaparkan sebagai compact action card;
- approval card ada payload ringkas, scope, expiry dan butang Approve/Reject;
- reduced-motion, keyboard access dan screen-reader labels;
- tiada secrets dalam DOM, localStorage atau URL.

## Cadangan UX berbanding GrokBot

Ambil corak terbaik seperti persistent conversation, quick actions, multimodal input dan agentic tool loop. Jangan salin unrestricted autonomy. Untuk ABANGCOLEK, **policy-first copilot** lebih sesuai: model boleh merancang dan menyediakan tindakan, tetapi system yang menentukan authority dan receipt.

## Acceptance gate

Agent dianggap siap hanya selepas:

1. provider adapter contract dan mock provider lulus;
2. role/capability negative tests membuktikan cross-role access ditolak;
3. prompt injection dan tool-confusion tests lulus;
4. CRUD mutation menggunakan revision/idempotency;
5. approval gate menolak publish/delete/payment tanpa approval;
6. mobile, tablet dan desktop browser checks lulus;
7. runtime receipt membuktikan provider/model sebenar tanpa claim palsu.
