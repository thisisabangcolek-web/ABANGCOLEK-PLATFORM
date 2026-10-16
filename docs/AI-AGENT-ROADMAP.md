# ABANGCOLEK AI Agent — implementation roadmap

**Status:** PROPOSED / NOT IMPLEMENTED YET
**Last reviewed:** 16 Oktober 2026.

Dokumen ini memisahkan keputusan design daripada receipt implementation. Jangan tandakan item selesai hanya kerana UI mock atau provider catalog sudah ditambah.

## Phase 0 — contract dan safety

- [ ] `shared/ai-agent-contracts.ts`: roles, provider connections, models, agent profiles, conversations, tool calls, approvals dan receipts.
- [ ] `server/platform/ai-agent.ts`: role-aware policy, CRUD, revision, idempotency dan audit.
- [ ] Tool registry bersatu dengan capability metadata dan risk class.
- [ ] Negative tests untuk prompt injection, cross-role access, secret leakage dan unapproved mutation.

## Phase 1 — provider adapters

- [ ] BYOK OpenAI-compatible adapter dengan encrypted secret reference.
- [ ] OpenRouter adapter dengan model catalog refresh dan quota/status metadata.
- [ ] NVIDIA NIM adapter untuk self-hosted/API deployment yang dikonfigurasi.
- [ ] OpenCode Zen adapter hanya selepas official endpoint/auth contract disahkan.
- [ ] Ollama adapter untuk local network/device deployment; model pull kekal explicit.
- [ ] Mock provider untuk deterministic tests dan local preview.

## Phase 2 — role packs dan CRUD UI

- [ ] Founder Agent: business context, marketing, approvals dan operational summaries.
- [ ] Developer Agent: diagnostics, contracts, tests dan runtime readiness.
- [ ] Staff/Agent Assistant: assigned queue, QC, dealer dan SOP.
- [ ] Customer Assistant: product, order status, receipt dan complaint intake.
- [ ] CRUD screens untuk agent profile, provider, model preference, conversation dan tool grants.

## Phase 3 — mobile-first experience

- [ ] Phone composer dengan streaming state, attachments dan voice-ready boundary.
- [ ] Tablet two-pane layout.
- [ ] Desktop sidebar + conversation + tool receipt panel.
- [ ] Approval cards dengan payload, scope, expiry, Approve, Reject dan Undo.
- [ ] Offline draft sahaja; jangan execute external mutation ketika offline.

## Phase 4 — integrations dan automations

- [ ] Connect ke existing Social, Plugins dan Automations contracts.
- [ ] Calendar → content draft → provider-specific preview → founder approval.
- [ ] Read-only app search dahulu; write tools dibuka satu per satu dengan receipt.
- [ ] Scheduled jobs dengan lease, retry bound dan failure notification.

## Definition of done

- Lint, unit/platform tests, build dan mobile/tablet/desktop browser checks lulus.
- Setiap provider yang ditanda `free` ada source URL, verification date dan quota note.
- Tiada provider/API key/secret dipalsukan dalam mock atau docs.
- Founder boleh revoke connection dan archive agent profile.
- Current Source of Truth dan docs index dikemas kini bersama receipt.
