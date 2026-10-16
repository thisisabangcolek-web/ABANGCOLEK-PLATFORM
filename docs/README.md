# Indeks dokumentasi ABANGCOLEK-PLATFORM

**Last reviewed:** 16 Oktober 2026. Gunakan dokumen berlabel **CURRENT_AUTHORITY** untuk keputusan dan operasi. Dokumen bertarikh dalam `reports/` ialah evidence sejarah atau research reference, bukan bukti runtime/provider semasa.

## Mula di sini

1. [README projek](../README.md) — cara menjalankan, struktur repo dan verification commands.
2. [Source of Truth](ABANGCOLEK-SOURCE-OF-TRUTH.md) — source, runtime/data authority, roles, feature registry dan boundaries.
3. [Platform status 16 Oktober](ABANGCOLEK-PLATFORM-STATUS-2026-10-16.md) — snapshot semasa yang menyatukan Social, Plugins, Automation, Founder login dan preview.
4. [Project alignment backlog](PROJECT-ALIGNMENT-BACKLOG.md) — task IDs, dependencies dan acceptance.
5. [Handover A–Z](handover/AGENT-HANDOVER-A-Z.md) — startup, recovery, ownership dan rollback.
6. [Markdown alignment register](handover/MARKDOWN-ALIGNMENT-REGISTER.md) — klasifikasi dokumen dan historical provenance.

## AI Agent — current design, bukan claim selesai

- [AI Agent architecture](AI-AGENT-ARCHITECTURE.md) — role packs, provider abstraction, tool access, CRUD, approval dan mobile-first UX.
- [AI Agent roadmap](AI-AGENT-ROADMAP.md) — phase, acceptance dan definition of done.
- [AI provider/free-model register](AI-PROVIDER-FREE-MODELS-REGISTER.md) — catalog provider perlu source URL, quota note dan verification date.

**Peringatan:** AI Agent, provider adapters dan unrestricted app access belum boleh dianggap production-connected sehingga source, tests dan runtime receipt wujud. "Free model" tidak bermaksud unlimited atau tanpa hardware/network cost.

## Current operations

- [Platform recovery runbook](runbooks/platform-recovery.md) — pilih source/runtime/data dengan sengaja.
- [Credential revocation audit](runbooks/credential-revocation-audit.md) — owner action untuk revoke/rotate tanpa meletakkan secret dalam chat atau Git.
- [Architecture](ABANGCOLEK-PLATFORM-ARCHITECTURE.md) — domain boundaries untuk founder intelligence dan content/outcome records.
- [Decisions](decisions/) — ADR dan keputusan governance yang mengatasi cadangan historical.

## Product dan domain references

- [Social research](../reports/RESEARCH_PRODUK_SOSIAL_ABANGCOLEK_2026-10-03.md) — product/image evidence dan unknowns.
- [Image inventory](../reports/INVENTORI_IMEJ_PRODUK_ABANGCOLEK_2026-10-03.md) — foto sebenar berbanding mascot/artwork.
- [JEV](../JEV.md) — research/reference; runtime semasa kekal LOCAL_RULES sehingga receipt baharu mengesahkan sebaliknya.
- [Research index](../reports/research/2026-10-02/README.md) — dated research tentang Grok Bot, Hermes, DeepSeek, Muse, social automation dan domain bisnes.

## Cara membaca folder

| Folder | Authority | Kegunaan |
|---|---|---|
| `docs/` | Current decisions, runbooks, architecture dan plans | Rujukan kerja harian |
| `docs/decisions/` | Current ADR | Keputusan yang mengikat design/operations |
| `docs/handover/` | Current handover dan inventory | Continuity, recovery dan provenance |
| `docs/superpowers/plans/` | Historical atau implementation plan | Jangan anggap sebagai receipt tanpa test/runtime evidence |
| `reports/` | Historical snapshot/research/audit | Evidence bertarikh; semak authority banner |
| `var/` | Runtime/log artifacts | Bukan source of truth dan tidak dibaca sebagai product docs |
| `.kilo/worktrees/` | Worktree/tool artifacts | Di luar scope dokumentasi canonical |

Dokumen lama dikekalkan untuk provenance. Ia tidak dipadam atau ditulis semula hanya untuk menghilangkan sejarah; jika bercanggah, dokumen current authority dan receipt terbaru mengatasi kandungan lama.
