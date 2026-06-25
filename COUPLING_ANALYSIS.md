# Coupling Analysis — IBRA Global English

## Metodologi
Analisis dilakukan dengan melacak seluruh dependency import antar modul di `src/` untuk mengidentifikasi pola coupling (keterikatan) tinggi dan rendah.

---

## 1. Supabase Client — Hub-and-Spoke ✅ (Coupling Rendah/Baik)

```
src/utils/supabase/
├── config.js          ← digunakan oleh 12+ file
├── client.js          ← digunakan oleh 14+ file (createClient)
├── server.js          ← digunakan oleh API routes
└── adminAuth.js       ← digunakan oleh 7+ API routes (checkAdminAuth)
```

**Verdict:** Pola yang baik. Semua akses database terpusat melalui satu titik. Perubahan konfigurasi hanya perlu di satu tempat.

---

## 2. API Routes — HIGH COUPLING ⚠️ (Duplikasi Boilerplate)

Setiap route API mengulang pola yang sama:
```js
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";
import { checkAdminAuth } from "@/utils/supabase/adminAuth";
```

**File terkena (10+ route):**
- `api/register/route.js`
- `api/announcements/route.js`
- `api/gallery/route.js`
- `api/online-schedule/route.js`
- `api/maintenance/route.js`
- `api/admin/delete-user/route.js`
- `api/admin/update-role/route.js`
- `api/admin/ai-assist/route.js`
- `api/ai-chat/route.js`
- `api/whatsapp-simulator/route.js`

**Rekomendasi:** Buat middleware/helper `api/_middleware.js` atau `withAdminAuth(handler)` untuk mengurangi duplikasi.

---

## 3. Dashboard CSS — COUPLING KAKU ⚠️

6 file CSS selalu diimpor bersamaan di 4 halaman:
```
dashboard-layout.css
dashboard-ui.css
dashboard-modal.css
dashboard-mobile.css
dashboard-utilities.css
dashboard-print.css
```

**File terkena:**
- `admin/layout.js`
- `student/page.js`
- `tutor/page.js`
- `parent/page.js`

**Rekomendasi:** Gabungkan menjadi 1-2 file CSS (`dashboard.css` + `dashboard-print.css`) untuk mengurangi import overhead.

---

## 4. Fallback Data — MEDIUM COUPLING ⚠️

`fallbackData.js` mengekspor banyak konstanta yang digunakan oleh banyak file:
| Konstanta | Digunakan Oleh |
|---|---|
| `DEFAULT_PROGRAMS` | `Programs.jsx`, `admin/landing-page/page.js` |
| `DEFAULT_BENEFITS` | `Benefits.jsx`, `admin/landing-page/page.js` |
| `DEFAULT_FAQS` | `FAQ.jsx`, `admin/landing-page/page.js` |
| `DEFAULT_VIDEOS` | `GalleryClient.jsx`, `admin/landing-page/page.js`, `admin/gallery/page.js` |
| `DEFAULT_TAX_*` | `admin/tax/page.js` |

**Rekomendasi:** Cukup baik, tetapi jika struktur data berubah, semua consumer harus diubah. Pertimbangkan tipe/validasi bersama.

---

## 5. Admin Pages — TIGHT COUPLING DENGAN SUPABASE ⚠️

Setiap halaman admin langsung mengimpor `createClient` dan membuat koneksi Supabase sendiri. Ini menyebabkan:
- Tidak ada lapisan service/abstraksi
- Pengecekan auth diulang di setiap halaman
- Jika cara inisialisasi client berubah, 11+ file harus diedit

**File terkena:**
`admin/attendance`, `admin/calendar`, `admin/finance`, `admin/landing-page`, `admin/placement-test`, `admin/reports`, `admin/students`, `admin/tax`, `admin/page`, `admin/layout`

---

## 6. Component-to-Component — LOW COUPLING ✅

| Component | Dependencies |
|---|---|
| `Hero.jsx` | → `CountUp` (satu dependency) |
| `HomeClient.jsx` | → 8 komponen (dynamic import) |
| `GalleryClient.jsx` | → 6 komponen |
| `Admin layout.js` | → `AICopilotWidget` |
| `Tutor/page.js` | → `AICopilotWidget` |
| `Parent/page.js` | → `RadarChart`, `LineChart` |
| `Student/page.js` | → `SpeakingPractice` |

**Verdict:** Baik. Komponen cukup independen dan hanya bergantung pada komponen yang benar-benar dibutuhkan.

---

## Ringkasan & Skor Coupling

| Area | Skor Coupling | Severity |
|---|---|---|
| Supabase utilities | ✅ **Rendah** (terpusat) | - |
| API Routes | ⚠️ **Tinggi** (boilerplate duplikat) | **Medium** |
| Dashboard CSS | ⚠️ **Sedang** (import kaku) | **Low** |
| Fallback Data | ⚠️ **Sedang** (shared dependency) | **Low** |
| Admin Pages → Supabase | ⚠️ **Tinggi** (Direct coupling) | **Medium** |
| Antar Komponen | ✅ **Rendah** (independen) | - |

## Prioritas Rekomendasi

1. 🔴 **Buat middleware API helper** — kurangi duplikasi boilerplate di 10+ route API
2. 🟡 **Gabung CSS dashboard** — 6 file menjadi 1-2 file
3. 🟡 **Buat service layer untuk admin** — abstraksi akses Supabase dari admin pages
4. 🟢 **Tidak perlu perubahan** — komponen sudah terpisah dengan baik, utility sudah terpusat