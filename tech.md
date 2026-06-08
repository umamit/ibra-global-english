# Panduan Teknologi (tech.md) - Ibra Global English Bobong

Dokumen ini menjelaskan arsitektur teknis, tumpukan teknologi (tech stack), fitur-fitur lanjutan, dan konfigurasi integrasi AI yang diterapkan pada landing page **Ibra Global English Bobong**.

---

## 1. Arsitektur & Tumpukan Teknologi (Tech Stack)

Website ini dirancang sebagai Single-Page Application (SPA) yang sangat cepat, responsif, dan ramah terhadap Agen AI.

### Core Stack
*   **Struktur**: HTML5 Semantik.
*   **Logika & Interaktivitas**: Vanilla JavaScript (ES6+). Bebas framework berat (seperti React/Vue) untuk meminimalkan beban eksekusi script pada perangkat mobile berkinerja rendah.
*   **Gaya (Styling)**: Vanilla CSS3 modern dengan Variabel CSS (Custom Properties) untuk mendukung *Dark/Light Mode* secara dinamis dan transisi yang halus.

### Pustaka & CDN Eksternal
*   **Font**: [Montserrat](https://fonts.google.com/specimen/Montserrat) oleh Google Fonts (berat 300, 400, 500, 600, 700, 800, 900) untuk tipografi premium yang modern.
*   **Animasi**: [Animate On Scroll (AOS)](https://michalsnik.github.io/aos/) v2 via unpkg CDN untuk memberikan efek transisi pemuatan konten yang interaktif dan premium.

### Lingkungan Server & Hosting
*   **Server Produksi**: [Cloudflare Pages](https://pages.cloudflare.com/) untuk pengiriman konten berbasis CDN global super cepat dan aman.
*   **Server Lokal (Development)**: Script Ruby custom (`server.rb`) menggunakan pustaka `WEBrick` pada port `8000`. Script ini mengemulasikan fitur-fitur Cloudflare Pages seperti penawaran konten markdown dan header HTTP khusus.

---

## 2. Fitur Web & Optimisasi Lanjutan

Website ini mengintegrasikan berbagai teknik rekayasa web modern untuk meningkatkan SEO, Keamanan, Performa (Core Web Vitals), dan Aksesibilitas.

### A. Core Web Vitals & Optimisasi Kinerja
*   **DNS Preconnect**: Menambahkan tag `<link rel="preconnect">` untuk Google Fonts, CDN AOS (`unpkg.com`), dan CDN gambar Unsplash (`images.unsplash.com`) guna memotong waktu handshaking koneksi.
*   **LCP (Largest Contentful Paint) Optimization**: Gambar Hero utama ditandai dengan `fetchpriority="high"` dan `loading="eager"` agar dimuat paling pertama oleh browser mobile tanpa hambatan.
*   **Lazy Loading**: Seluruh gambar galeri dan logo footer menggunakan atribut `loading="lazy"` guna menghemat kuota data seluler pengunjung.
*   **Font Rendering**: Pemuatan Google Fonts dipindahkan dari `@import` CSS ke tag `<link>` paralel di HTML untuk menghindari *render-blocking chain*, mempercepat *First Contentful Paint (FCP)*.

### B. Keamanan & Proteksi Anti-Spam
*   **Honeypot Anti-Spam**: Input tersembunyi `#honeypot-input` ditambahkan pada form pendaftaran. Jika bot otomatis mengisi kolom ini, JavaScript secara senyap akan membatalkan submit. Metode ini memblokir spam 100% tanpa mengganggu kenyamanan pengguna manusia dengan tantangan CAPTCHA yang menyebalkan.
*   **Security Headers (Cloudflare `_headers`)**:
    *   `X-Frame-Options: DENY` (mencegah serangan clickjacking).
    *   `X-Content-Type-Options: nosniff` (mencegah eksploitasi sniffing tipe MIME).
    *   `Referrer-Policy: strict-origin-when-cross-origin` (melindungi privasi referrer).
    *   `Permissions-Policy`: Membatasi akses sensor perangkat yang tidak digunakan (kamera, mik, lokasi, dll.).

### C. SEO Lokal & Schema Structured Data
Website ini mengimplementasikan teknik SEO Lokal yang agresif untuk mendominasi kata kunci pencarian di daerah **Bobong** dan **Pulau Taliabu**:
*   **JSON-LD Local Business**: Menyediakan skema `EducationalOrganization` dengan rincian alamat fisik, kontak, wilayah cakupan, dan koordinat instansi untuk memperkuat indeks Google Maps.
*   **JSON-LD FAQ Rich Snippets**: Menyediakan skema `FAQPage` berisi daftar pertanyaan umum. Memungkinkan hasil pencarian Google menampilkan widget akordeon interaktif langsung di Search Engine Result Page (SERP).
*   **Tag Kanonikal**: Menyediakan `<link rel="canonical" href="https://www.ibraglobalenglish.uk/">` untuk menyatukan kekuatan SEO dan mencegah isu konten duplikat antara subdomain www/non-www atau protokol HTTP/HTTPS.
*   **Sitemap & Robots**: File `sitemap.xml` dinamis dan `robots.txt` standar untuk mempermudah perayapan (crawling) oleh Googlebot.

### D. Aksesibilitas (A11y) & Estetika Premium
*   **Focus Visible**: Styling kustom `:focus-visible` memberikan indikator outline teal kontras tinggi ketika pengguna menavigasi website menggunakan keyboard (tombol Tab), memenuhi standar aksesibilitas WCAG 2.1.
*   **Custom Scrollbar**: Scrollbar kustom yang menyesuaikan warna berdasarkan tema aktif (gelap/terang).
*   **Print Layout**: Rule `@media print` khusus yang menyembunyikan elemen non-cetak (tombol melayang, navigasi, modal) dan mengubah warna teks menjadi hitam di atas putih murni untuk hasil cetak fisik/PDF yang bersih dan hemat tinta.

---

## 3. Kesiapan Agen AI & Integrasi WebMCP

Ibra Global English adalah pelopor dalam **Agent-Readiness** (Kesiapan Agen AI). Website ini dapat dibaca, dipahami, dan dikendalikan secara langsung oleh Agen AI pintar (seperti Google Gemini, ChatGPT, Claude) secara otonom.

### A. Negosiasi Konten Markdown (Agentic Content Negotiation)
Ketika Agen AI mengakses halaman beranda (`/` atau `/index.html`), agen tersebut dapat mengirimkan header HTTP berikut:
```http
Accept: text/markdown
```
Server (`server.rb` di lokal, atau Cloudflare Worker Middleware `_middleware.js` di produksi) akan mendeteksi header tersebut dan mengembalikan isi berkas **`index.md`** yang bersih dan ringkas, bukan kode HTML penuh. Langkah ini menghemat hingga **90% token konteks** Agen AI dan mempercepat waktu pemrosesan secara drastis!

### B. Deklarasi WebMCP & Penemuan Otomatis (Discovery)
Website ini menyediakan titik akhir (endpoints) standar untuk mempermudah agen menemukan kapabilitas interaksi:
1.  **Header Link**: Beranda menyertakan header Link untuk mengarahkan agen ke katalog kapabilitas:
    ```http
    Link: </.well-known/api-catalog>; rel="api-catalog", </.well-known/agent-skills/index.json>; rel="agent-skills", </.well-known/mcp/server-card.json>; rel="mcp-server-card"
    ```
2.  **API Catalog**: Berkas `.well-known/api-catalog` yang mendeskripsikan lokasi skema WebMCP.
3.  **MCP Server Card**: Berkas `.well-known/mcp/server-card.json` yang mendeklarasikan alat (tools) browser yang tersedia untuk dijalankan otonom oleh Agen AI.

### C. Registrasi Alat Browser (Model Context Protocol - WebMCP)
Melalui JavaScript (`index.js`), website ini mendaftarkan alat interaktif langsung ke context browser Agen AI:
1.  **`get_program_details`**:
    *   **Deskripsi**: Mengambil detail lengkap mengenai program kursus (Kids, Teens, Calistung).
    *   **Input**: Nama program.
2.  **`register_course`**:
    *   **Deskripsi**: Mengisi formulir pendaftaran secara otonom di latar belakang dan memicu pengalihan pendaftaran WhatsApp siswa secara otomatis.
    *   **Input**: `name`, `whatsapp`, `program`.

---

## 4. Panduan Menjalankan Lokal & Deployment

### Menjalankan Server Lokal (Lokal Ruby WEBrick)
Pastikan Anda memiliki Ruby terinstal di sistem Anda, lalu jalankan perintah berikut dari direktori utama proyek:
```bash
ruby server.rb
```
Server lokal akan berjalan di alamat **`http://localhost:8000`** dan mendukung simulasi negosiasi markdown `Accept: text/markdown` secara penuh.

### Deployment ke Cloudflare Pages
Gunakan Cloudflare Wrangler CLI untuk mempublikasikan halaman ke produksi:
```bash
npx wrangler pages deploy .
```
Semua file statis di direktori root akan diunggah, dan Cloudflare Pages Functions di folder `functions/` akan dikompilasi secara otomatis sebagai fungsi Serverless middleware.
