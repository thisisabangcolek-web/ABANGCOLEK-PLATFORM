# ABANGCOLEK-PLATFORM — Architecture v0.1

## Arah sistem

ABANGCOLEK-PLATFORM kekal sebagai **modular monolith React/Vite + Bun + SQLite**. Social/content intelligence menjadi domain first-class yang menghubungkan founder identity kepada operasi, bukan saluran publish automatik.

```text
Founder identity graph
        |
        v
Content registry -----> Event / location context
        |                         |
        v                         v
  Outcomes (enquiry/order/lead) -> Order / fulfilment ledger
        |
        v
Analytics: reach | trust | conversion | retention
```

## Vertical slice awal

| Lapisan | Artefak | Peranan |
|---|---|---|
| Contract | `shared/founder-intelligence-contracts.ts` | Status/entity typed untuk identity, content, event, outcome dan summary |
| Domain | `server/platform/founder-intelligence.ts` | Validasi, revision, founder authority, audit dan derived analytics |
| API | `/api/platform/founder-intelligence/*` | Read/write lokal untuk onboarding manual dan metric capture |
| Storage | `records` SQLite table melalui `PlatformStore` | Tiada schema vendor baharu; semua writes typed melalui domain |
| UI | Founder growth workspace | Akan menggunakan read model analytics/content selepas API stabil |

## Entity boundaries

- **Social identity**: akaun awam dan hubungan entity; `RELATED_ENTITY`/`UNVERIFIED` tidak boleh auto-merge kepada ABANGCOLEK.
- **Content**: URL, media, pillar, funnel, rights, approval dan snapshot metrik; caption lama bukan bukti harga, stok atau ownership.
- **Event**: lokasi, tempoh, content yang berkaitan, lead dan order IDs.
- **Outcome**: hubungan eksplisit content → enquiry/order/lead/event; tiada atribusi automatik berdasarkan views.
- **Analytics**: read model derived daripada content/outcome records; pisahkan reach, engagement dan outcome.

## Guardrails

1. Founder authority diperlukan untuk mutation vertical slice.
2. Rights/approval direkodkan berasingan daripada status publish.
3. Semua mutation menggunakan revision/audit; external provider belum diaktifkan.
4. Order ID mesti wujud dalam ledger sebelum outcome order boleh dipautkan.
5. Metrik hanyalah snapshot dengan `capturedAt`, bukan sejarah lengkap platform sosial.

## Urutan seterusnya

1. Tambah UI capture untuk identity/content/event dan analytics cards.
2. Tambah test route penuh dan fixture onboarding founder.
3. Tambah content-to-calendar linkage kepada `CalendarEventRecord` selepas definisi event operasi founder dipersetujui.
4. Tambah approval workflow terperinci (`idea → draft → rights → entity/product check → founder approval → export`).
5. Hanya selepas capability, rights, quota dan receipt vendor disahkan: bina adapter publish/read metrics.
