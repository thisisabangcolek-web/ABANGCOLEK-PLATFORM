# Runbook Revokasi & Audit Keselamatan Kredensial ABANGCOLEK (B01)

**Tarikh:** 4 Oktober 2026  
**Status:** READY_FOR_OWNER_EXECUTION  
**Klasifikasi:** KESELAMATAN & AKSES  
**Objektif:** Menyediakan arahan langkah-demi-langkah bagi pemilik akaun untuk membatalkan (revoke), memutarkan (rotate), dan mengaudit kredensial yang terdedah dalam sesi terdahulu tanpa mendedahkan sebarang nilai rahsia dalam git/dokumentasi.

---

## 1. Prinsip Keselamatan Utama (Zero-Leak Policy)
1. **Dilarang Menyalin Rahsia**: Jangan sekali-kali menampal nilai API key, service role secret, atau token sebenar ke dalam chat, fail Markdown, atau log terminal.
2. **Topeng Pengecam (Masked Identifiers)**: Gunakan hanya 4 aksara awal atau akhir (contoh: `AIzaSy...4x9Q`, `sbp_...91fa`) untuk merujuk kunci yang terlibat.
3. **Pemisahan Kunci**: Bezakan antara kunci awam (publishable/anon key) dengan kunci rahsia pelayan (service role / private secret).

---

## 2. Senarai Akaun & Kredensial Terlibat

### A. Supabase API & Service Role Key
*   **Perkhidmatan**: Pengkalan Data Awan & Storan Objek Warisan
*   **Tindakan Pemilik**:
    1. Log masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
    2. Pilih projek ABANGCOLEK (`hylqg...`).
    3. Pergi ke **Project Settings** ➔ **API**.
    4. Di bahagian **Project API Keys**:
       - Klik **Generate new key** untuk `service_role` secret.
       - Batalkan (Revoke) kunci `service_role` yang lama.
    5. Di bahagian **Authentication** ➔ **Policies**:
       - Sahkan semua jadual mempunyai Row Level Security (RLS) berstatus `ENABLED`.
    6. Di bahagian **Project Settings** ➔ **Database**:
       - Tukar kata laluan pangkalan data PostgreSQL jika kata laluan asal pernah dikongsi.

### B. Google AI Studio / Gemini API Key
*   **Perkhidmatan**: Pembantu AI Founder & Ekstraksi Warisan
*   **Tindakan Pemilik**:
    1. Buka [Google AI Studio - Get API Key](https://aistudio.google.com/app/apikey).
    2. Kenal pasti kunci yang dijana pada atau sebelum Oktober 2026.
    3. Klik ikon tong sampah / **Delete Key** untuk memadamkan kunci lama.
    4. Klik **Create API Key** untuk menjana kunci baharu khusus untuk projek ABANGCOLEK.
    5. Tetapkan had kuota (quota alerts) dan sekatan API (API restrictions) dalam Google Cloud Console jika dipautkan ke akaun pengebilan.

### C. GitHub Repository Access & Webhooks
*   **Perkhidmatan**: Repositori Kod Sumber `thisidowgnut-source/ABANGCOLEK-PLATFORM`
*   **Tindakan Pemilik**:
    1. Pergi ke **Settings** ➔ **Secrets and variables** ➔ **Actions**.
    2. Semak senarai rahsia repositori. Padam sebarang rahsia yang tidak lagi digunakan.
    3. Jika terdapat Personal Access Token (PAT) peribadi yang pernah digunakan dalam persekitaran tempatan, batalkan di [GitHub Personal Access Tokens](https://github.com/settings/tokens).

---

## 3. Templat Resit Pengesahan Pemilik (Audit Receipt)

Selepas pemilik melengkapkan langkah di atas, salin dan lengkapkan resit berikut (simpan dalam `var/log/credential-rotation-receipt.json` atau berikan pengesahan):

```json
{
  "taskId": "B01",
  "status": "ROTATION_CONFIRMED",
  "executedBy": "OWNER",
  "executedAt": "2026-10-04TXX:XX:XX+08:00",
  "rotations": [
    {
      "provider": "Supabase",
      "keyType": "service_role_secret",
      "oldKeyMasked": "eyJhb...skrceeo",
      "newKeyMasked": "eyJhb...[NEW]",
      "action": "REVOKED_AND_ROTATED",
      "rlsVerified": true
    },
    {
      "provider": "Google AI Studio",
      "keyType": "gemini_api_key",
      "oldKeyMasked": "AIzaSy...[OLD]",
      "newKeyMasked": "AIzaSy...[NEW]",
      "action": "REVOKED_AND_ROTATED"
    }
  ],
  "accessAuditOutcome": "NO_UNAUTHORIZED_USAGE_OBSERVED"
}
```
