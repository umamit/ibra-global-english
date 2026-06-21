# Project Rules: Security-First Performance Optimization

Optimasi performa pada proyek Next.js App Router ini wajib mematuhi prinsip Security-First. Setiap perubahan kode untuk mempercepat situs (seperti perbaikan TTFB, LCP, atau TBT) wajib mempertahankan dan mematuhi aturan keamanan berikut:

1. **Variabel Lingkungan Sensitif**: Jangan pernah mengubah variabel lingkungan sensitif menjadi `NEXT_PUBLIC_` demi kemudahan akses klien.
2. **Middleware / Proxy Security**: Optimasi file `proxy.js` (atau middleware) tidak boleh melonggarkan proteksi rute autentikasi atau bypass URL.
3. **Cache-Control & Data Privasi**: Penggunaan caching atau CDN header tidak boleh membocorkan data pribadi user (ikuti aturan `Cache-Control: private, no-cache, no-store, must-revalidate` atau data-level isolation).
4. **Content Security Policy (CSP)**: Setiap penghentian blocking script tidak boleh menonaktifkan kebijakan Content Security Policy (CSP) yang ketat.
5. **Pemindaian Keamanan Internal**: Jalankan pemindaian celah keamanan internal (regresi siber) otomatis (seperti pengetesan/analisis statis atau verifikasi header via curl) setiap kali selesai memperbarui kode untuk memastikan tidak ada celah keamanan baru yang tercipta.

## Aturan Khusus Dasbor Admin (`app/admin` & Halaman Dashboard)

Setiap perubahan, penulisan kode baru, atau optimasi di dalam dasbor admin wajib mematuhi aturan berikut:
1. **Larangan Caching Publik**: Dilarang keras menggunakan Caching Publik (`Cache-Control: public`). Semua data admin harus bersifat privat dan diambil langsung dari server pada setiap request (gunakan header `Cache-Control: private, no-cache, no-store, must-revalidate` atau pastikan disajikan dinamis tanpa caching).
2. **React Suspense & Skeleton Loader**: Gunakan React `Suspense` dengan Skeleton Loader untuk tabel atau grafik yang membutuhkan waktu muat lama, agar performa TBT dan LCP halaman admin tetap bagus tanpa memutuskan koneksi data.
3. **Validasi Peran Mutasi (RBAC)**: Pastikan semua fungsi mutasi data (POST/PATCH/DELETE) di dalam dasbor admin dan API endpoint terkait tetap melalui validasi peran (role-based access control, memastikan hanya role `admin` yang dapat mengeksekusi) sebelum dijalankan.

## Aturan Khusus Metadata, Aksesibilitas, & Font Lokal

1. **Metadata Dinamis**: Tag metadata (seperti `title`, `description`, `canonical URL`) wajib diatur secara dinamis melalui Metadata API bawaan Next.js (`generateMetadata`) tanpa memicu manipulasi header sisi server.
2. **Aksesibilitas (WCAG AA)**: Seluruh tombol ikon harus memiliki `aria-label` yang dinamis dan deskriptif. Navigasi dot kuis/slider wajib menggunakan semantic `<button type="button">` agar ramah pembaca layar dan keyboard.
3. **Kontras Warna**: Teks sekunder (seperti abu-abu) wajib menggunakan warna dengan rasio kontras minimal 4.5:1 terhadap latar belakang (contoh: `#59616e` di mode terang dan `#8c95a0` di mode gelap).
4. **Font Lokal (Self-Hosted)**: Seluruh font wajib di-self-host menggunakan `next/font/google` secara lokal untuk menghindari pemuatan CDN eksternal yang memblokir render, menghilangkan pergeseran tata letak (CLS), dan memungkinkan penutupan domain eksternal Google Fonts (`fonts.googleapis.com` & `fonts.gstatic.com`) dari aturan Content Security Policy (CSP).

## Aturan Khusus Rate Limiting & Proteksi DDoS

1. **Larangan Penggunaan Memori Lokal**: Jika membuat sistem Rate Limiting atau proteksi DDoS, dilarang keras menggunakan memori lokal (in-memory caching/variables) di lingkungan serverless.
2. **Integrasi Eksternal (Tanpa Vercel KV)**: Gunakan fitur keamanan bawaan Vercel Web Application Firewall (WAF) atau Cloudflare untuk memproses pembatasan request agar tidak membebani fungsi serverless. Jangan menggunakan Vercel KV untuk menghemat kuota gratis.

## Aturan Batasan Vercel Hobby & Supabase Free Tier

1. **Hindari Bloatware**: Dilarang menginstal library/pustaka pihak ketiga baru yang tidak krusial yang dapat memperbesar ukuran bundel kompilasi (build size).
2. **Efisiensi Bandwidth Supabase**: Hindari query database yang boros bandwidth (seperti mengambil kolom besar yang tidak diperlukan, atau memanggil query secara berulang tanpa pembatasan `.limit()` atau tanpa pagination).
3. **Pembatasan Optimasi Gambar**: Gunakan komponen `next/image` hanya untuk gambar LCP utama dengan properti `priority`. Semua gambar kecil dan di bawah lipatan layar harus menggunakan tag `<img>` HTML biasa dengan `loading="lazy"` agar hemat kuota optimasi gambar Vercel (maksimal 1.000 gambar per bulan).

## Aturan Khusus Sesi Autentikasi & Supabase Client Sisi Browser

1. **Pola Klien Singleton**: Di sisi browser (client-side), gunakan pola singleton untuk `createClient()` Supabase (simpan instance di tingkat modul) agar tidak terjadi instansiasi ulang klien pada setiap siklus rendering. Ini mencegah pembersihan `useEffect` yang tidak disengaja yang dapat memicu `signOut()`.
2. **Penyimpanan Default (Cookie-based)**: Jangan pernah melakukan override opsi penyimpanan auth Supabase (`storage`) menggunakan `window.sessionStorage` secara global pada browser client, karena hal ini merusak sinkronisasi cookie sesi otomatis dari `@supabase/ssr` ke Next.js Server Components / API middleware.
3. **Pemisahan Logika Sesi**: Jika ingin menerapkan deteksi penutupan tab atau kedaluwarsa sesi kustom (seperti `login_time`), simpan status tersebut secara independen (misal: di cookie atau sessionStorage kustom) tanpa mengganggu penyimpanan sesi utama milik Supabase.
