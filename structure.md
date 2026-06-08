# Struktur Folder (structure.md) - Ibra Global English Bobong

Dokumen ini menjelaskan struktur direktori proyek, fungsi setiap file, dan bagaimana berbagai bagian sistem saling berhubungan pada proyek **Ibra Global English Bobong**.

---

## 1. Pohon Direktori (Directory Tree)

Berikut adalah peta struktur berkas dalam repositori proyek:

```text
ibra-global-english/
├── .nojekyll
├── CNAME
├── _headers
├── ads.txt
├── auth.md
├── index.css
├── index.html
├── index.js
├── index.md
├── manifest.json
├── product.md
├── robots.txt
├── server.rb
├── sitemap.xml
├── structure.md
├── tech.md
├── wrangler.jsonc
├── .well-known/
│   ├── api-catalog
│   ├── http-message-signatures-directory
│   ├── oauth-authorization-server
│   ├── oauth-protected-resource
│   ├── openid-configuration
│   ├── agent-skills/
│   │   └── index.json
│   └── mcp/
│       └── server-card.json
├── assets/
│   ├── apple-touch-icon.png
│   ├── favicon.png
│   ├── logo.gif
│   ├── logo.png
│   └── [gambar-gambar galeri / ilustrasi lainnya...]
└── functions/
    └── _middleware.js
```

---

## 2. Penjelasan Berkas & Folder

### A. Berkas di Direktori Root

| Nama Berkas | Tipe | Deskripsi |
| :--- | :--- | :--- |
| **`index.html`** | HTML | Berkas utama landing page. Dilengkapi optimisasi SEO on-page, integrasi Google Analytics, Cloudflare Analytics, Google Fonts Montserrat, pustaka animasi AOS, dan skema data terstruktur JSON-LD (FAQPage & EducationalOrganization). |
| **`index.css`** | CSS | Lembar gaya utama. Mendukung responsive layout (mobile-first), variabel warna dynamic dark/light mode, custom scrollbar, outline fokus aksesibilitas tinggi, serta gaya `@media print` ramah cetak. |
| **`index.js`** | JS | Logika interaksi klien. Mengatur efek gulir header, menu mobile, inisialisasi AOS, penghitung angka statistik, penanganan form pendaftaran terproteksi honeypot anti-spam, pengalihan WhatsApp API, modal lightbox galeri, akordeon FAQ, toggle tema gelap, serta pendaftaran alat (tools) browser WebMCP. |
| **`index.md`** | Markdown | Berkas ringkas yang memuat versi teks ramah AI dari halaman utama. Berkas ini disajikan khusus untuk Agen AI yang meminta konten dengan header `Accept: text/markdown` guna menghemat token konteks. |
| **`auth.md`** | Markdown | Panduan pendaftaran dan autentikasi Agen AI (OAuth-Agentic). Berisi tata cara penemuan (discovery), pendaftaran anonim, verifikasi OTP email, penggunaan API Key, dan penanganan kesalahan. |
| **`manifest.json`** | JSON | Konfigurasi Progressive Web App (PWA). Memungkinkan website diinstal ke layar beranda ponsel pengguna sebagai aplikasi mandiri. |
| **`robots.txt`** | Teks | Berkas aturan pengindeksan untuk robot perayap mesin pencari (Googlebot, Bingbot, dll.). |
| **`sitemap.xml`** | XML | Peta situs lengkap yang mengindeks URL halaman utama untuk mempercepat proses indeks Google Search Console. |
| **`_headers`** | Teks | Aturan header HTTP khusus untuk server Cloudflare Pages. Mengatur kebijakan caching browser (`Cache-Control`) untuk mempercepat pemuatan aset serta header keamanan tingkat tinggi. |
| **`CNAME`** | Teks | Berkas penunjuk domain kustom produksi (`www.ibraglobalenglish.uk`) untuk Cloudflare Pages. |
| **`wrangler.jsonc`** | JSONC | Konfigurasi alat CLI Cloudflare Wrangler untuk melakukan pengujian lokal dan deployment ke Cloudflare Pages. |
| **`server.rb`** | Ruby | Server pengembangan lokal (WEBrick). Mengemulasikan negosiasi konten markdown dan header HTTP khusus seperti pada lingkungan produksi Cloudflare Pages. |
| **`.nojekyll`** | Teks | Berkas penanda kosong untuk memberi tahu platform hosting statis agar mengabaikan parser Jekyll saat memproses berkas statis. |
| **`product.md`** | Markdown | Katalog lengkap program pembelajaran resmi Ibra Global English Bobong (Kids Program, Teens Program, Fun Calistung). |
| **`tech.md`** | Markdown | Panduan teknis lengkap yang menjelaskan arsitektur web, SEO lokal, keamanan, optimisasi Core Web Vitals, dan WebMCP. |
| **`structure.md`** | Markdown | Panduan ini sendiri yang memetakan seluruh file dan folder serta alur kerja sistem. |

---

### B. Folder `.well-known/` (Standar Penemuan Agen AI)
Folder ini sangat penting untuk penemuan otonom kapabilitas website oleh Agen AI eksternal.

*   **`api-catalog`**: Katalog berformat JSON yang mengarahkan Agen AI ke dokumen spesifikasi fungsionalitas WebMCP.
*   **`oauth-protected-resource`** & **`oauth-authorization-server`**: Spesifikasi autentikasi OAuth untuk pendaftaran otonom Agen AI.
*   **`openid-configuration`**: Konfigurasi federasi identitas OpenID Connect.
*   **`http-message-signatures-directory`**: Kumpulan kunci penandatanganan pesan HTTP aman.
*   **`agent-skills/index.json`**: Daftar modul kapabilitas agen (Agent Skills) yang didukung oleh sistem untuk menangani pendaftaran kursus dan pengambilan rincian program.
*   **`mcp/server-card.json`**: Daftar deklarasi alat (WebMCP tools) browser seperti `get_program_details` dan `register_course` beserta skema input/output-nya yang siap dioperasikan oleh Agen AI.

---

### C. Folder `functions/` (Cloudflare Pages Functions)
Folder ini berisi kode backend (serverless) yang berjalan di server tepi (edge) Cloudflare.

*   **`_middleware.js`**: Middleware serverless produksi yang mencegat permintaan di halaman beranda (`/` atau `/index.html`). Jika mendeteksi bahwa pengunjung adalah Agen AI yang meminta konten berformat markdown (`Accept: text/markdown`), middleware ini akan mengalihkan respons untuk mengembalikan `index.md` alih-alih file HTML penuh.

---

### D. Folder `assets/` (Aset Visual & Gambar)
Menampung seluruh aset grafis instansi untuk memperindah tampilan visual website:

*   `logo.png` & `logo.gif`: Logo resmi Ibra Global English dengan skema warna teal yang selaras dengan tema situs.
*   `favicon.png` & `apple-touch-icon.png`: Ikon browser dan ikon aplikasi PWA untuk perangkat iOS/Android.
*   `*.jpg`/`*.png`: Berkas gambar pendukung seperti ilustrasi kelas interaktif, dokumentasi permainan belajar anak-anak, dan ulasan visual pendaftaran.

---

## 3. Alur Hubungan Komponen (System Workflows)

### Alur Pendaftaran Siswa Baru (Pengguna Manusia)
1.  Pengunjung mengisi nama, nomor WhatsApp, dan memilih program di form pendaftaran (`index.html`).
2.  JavaScript (`index.js`) memvalidasi data dan memastikan kolom honeypot anti-spam kosong.
3.  JavaScript memformat pesan WhatsApp pendaftaran secara rapi.
4.  Browser dialihkan ke tautan WhatsApp API resmi Ibra Global English (`https://wa.me/6281357001357`), langsung membuka aplikasi WhatsApp untuk menyelesaikan pendaftaran tanpa pop-up blocker.

### Alur Penemuan & Kendali Konten (Agen AI)
1.  Agen AI melakukan penemuan (discovery) dan mendeteksi header `Link` atau file di `.well-known/`.
2.  Agen AI mengirim permintaan GET ke beranda dengan header `Accept: text/markdown`.
3.  Middleware (`_middleware.js` di Cloudflare atau `server.rb` di lokal WEBrick) memproses dan merespons dengan berkas `index.md`.
4.  Agen AI mengeksekusi alat WebMCP browser (misalnya, `register_course`) lewat antarmuka browser otonom untuk mendaftarkan siswa secara otomatis tanpa keterlibatan manual.
