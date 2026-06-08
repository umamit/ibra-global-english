# Catatan Developer (Developer Notes) — Ibra Global English Website

Berkas ini berisi dokumentasi teknis mengenai struktur proyek, konfigurasi warna tema, konvensi kode, dan panduan menjalankan serta melakukan deployment website **Ibra Global English**.

---

## 🚀 Teknologi Utama (Tech Stack)
* **Framework**: Next.js `v16.2.7` (menggunakan React `v19.2.7`)
* **Styling**: Tailwind CSS `v4.0` (dikonfigurasi melalui `src/app/globals.css`)
* **Animasi**: AOS (Animate On Scroll) `v2.3.4`
* **Server Pengembangan**: Turbopack (Next.js 16)

---

## 📁 Struktur Folder Proyek
```text
ibra-global-english/
├── public/                 # File aset statis (Logo, Gambar)
│   └── assets/
│       ├── logo.png        # Logo Resmi (Warna dasar: #216c7e)
│       └── ...
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.js       # Layout Utama (AOS init, Google Fonts)
│   │   ├── page.js         # Halaman Utama (Main Landing Page)
│   │   └── globals.css     # CSS Global (Variabel tema, Tailwind v4)
│   ├── components/         # Komponen UI Modular
│   │   ├── Header.jsx      # Navigation Bar (dengan logo & link)
│   │   ├── Hero.jsx        # Banner Utama
│   │   ├── FAQ.jsx         # Pertanyaan Populer (Selaras dengan Google Rich Snippet)
│   │   ├── Footer.jsx      # Bagian Bawah Halaman (Menampilkan versi dinamis)
│   │   └── ...
│   └── proxy.js            # Sistem Perutean & Header Penjelajah (Next.js 16 Proxy)
├── package.json            # Konfigurasi Dependensi & Versi Website
├── next.config.mjs         # Konfigurasi Next.js (Membatasi Turbopack root)
└── DEVELOPER_NOTES.md      # Catatan Developer (Dokumentasi ini)
```

---

## 🎨 Sistem Warna Tema (Color Theme System)
Warna tema website telah disesuaikan 100% agar selaras dengan **warna dominan pada logo resmi** (`public/assets/logo.png`):

* **Primary (Deep Teal)**: `#216c7e` — Digunakan untuk elemen utama, tombol utama, teks judul, dan hiasan utama.
* **Primary Dark**: `#164d57` — Digunakan untuk efek hover/interaksi pada tombol primer.
* **Primary Light**: `#f0f7f8` — Digunakan untuk warna latar belakang kontainer lembut & efek glassmorphism navigasi.
* **Accent (Luxury Gold)**: `#A68849` — Digunakan untuk sub-tagline, ikon bintang, dan aksen sorotan penting.
* **Accent Light**: `#f3ede2` — Warna latar belakang kontainer sekunder yang hangat.

Seluruh konfigurasi warna ini dikelola menggunakan CSS Variables di bagian `:root` pada file [src/app/globals.css](file:///Users/husnitausman/Desktop/ibra-global-english/src/app/globals.css).

---

## 🔢 Pengelolaan Versi Otomatis (Automatic Versioning)
Versi website yang ditampilkan di bagian kanan bawah Footer diambil secara dinamis dari file [package.json](file:///Users/husnitausman/Desktop/ibra-global-english/package.json):

```json
{
  "name": "next-app-temp",
  "version": "0.1.0"
}
```

* **Cara Memperbarui Versi**: Cukup ganti nilai `"version": "x.y.z"` di dalam `package.json`. Website akan otomatis membaca dan menampilkan nomor versi baru tersebut di seluruh halaman browser seketika setelah di-build/redeploy.

---

## 🛠️ Panduan Pengembangan Lokal (Local Development)

### 1. Jalankan Server Pengembangan
Gunakan perintah berikut untuk memulai server lokal dengan fitur hot-reload Turbopack:
```bash
npm run dev
```
Buka browser Anda dan akses di: **`http://localhost:3000`**

### 2. Melakukan Uji Coba Build Produksi
Sebelum melakukan push atau deployment, pastikan seluruh kode berhasil ter-compile tanpa error dengan menjalankan:
```bash
npm run build
```

---

## ☁️ Panduan Deployment (Vercel)

Karena proyek ini dimigrasikan dari situs HTML statis biasa ke Next.js, Anda harus mengubah konfigurasi proyek Anda di Vercel Dashboard agar tidak mengalami error `404: NOT_FOUND`:

1. Buka **Vercel Dashboard** dan masuk ke pengaturan proyek Anda.
2. Pilih tab **`Settings`** > **`General`**.
3. Temukan pengaturan **`Framework Preset`**, ubah dari **`Other`** menjadi **`Next.js`**.
4. Klik **`Save`**.
5. Buka tab **`Deployments`**, pilih deployment terakhir, lalu klik **`Redeploy`** agar Vercel membangun proyek menggunakan mesin Next.js secara sempurna.
