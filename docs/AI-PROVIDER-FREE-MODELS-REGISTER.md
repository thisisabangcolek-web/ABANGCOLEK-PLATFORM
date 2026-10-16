# AI provider dan free-model register

**Status:** RESEARCH IN PROGRESS — jangan anggap model atau quota di bawah sebagai verified sehingga official source dan tarikh semakan dimasukkan.
**Last reviewed:** 16 Oktober 2026.

## Definition of free

Dalam register ini, `free` hanya boleh digunakan apabila provider menyatakan route/model itu tidak mengenakan caj token atau boleh dijalankan local tanpa per-token fee. Free tier boleh mempunyai rate limit, fair-use cap, queue, expiry, region restriction, hardware requirement atau syarat login. Setiap entry mesti menyimpan source URL, `verifiedAt`, auth method, tool-calling support dan limit note.

## Provider matrix

| Provider | Intended use | Free-model field | Verification |
|---|---|---|---|
| BYOK / OpenAI-compatible | User-owned key dan self-hosted gateways | Provider-dependent; tiada model universal | Pending official per-provider source |
| OpenRouter | Multi-provider routing dan fallback | Provider catalog `:free` entries jika masih ditawarkan | Pending live catalog check |
| NVIDIA NIM | Self-hosted/inference endpoint, GPU-aware | Dependent on NIM catalog/license/deployment | Pending current NVIDIA terms |
| OpenCode Zen | Coding-oriented gateway | Dependent on current Zen catalog/account terms | Pending official endpoint/terms |
| Ollama | Local/private device or server runtime | Open-weight models pulled locally; no token fee | Pending hardware/model compatibility matrix |

## Catalog schema yang akan digunakan

```text
providerId
modelId
displayName
freeMode: local | provider-free-tier | trial | unknown
contextWindow: number | null
toolCalling: supported | unsupported | unknown
vision: supported | unsupported | unknown
streaming: supported | unsupported | unknown
authMode
quotaNote
sourceUrl
verifiedAt
status: verified | stale | unknown
```

## Guardrails

Jangan hard-code model IDs daripada memory. Provider model list boleh berubah. Model yang ditanda `free` tidak boleh dipilih sebagai fallback production tanpa health check dan quota evidence. UI mesti membezakan `free`, `trial`, `local` dan `unknown` supaya founder tidak tersalah anggap zero-cost sebagai unlimited.

## Next update

Research provider akan diisi dengan official docs dan current model IDs sebelum adapter implementation ditutup. Selepas itu, tambah fixture mock untuk local preview dan tests yang memastikan stale/unknown catalog tidak boleh digunakan untuk execution berisiko.
