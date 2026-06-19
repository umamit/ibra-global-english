# Project Rules: Security-First Performance Optimization

Optimasi performa pada proyek Next.js App Router ini wajib mematuhi prinsip Security-First. Setiap perubahan kode untuk mempercepat situs (seperti perbaikan TTFB, LCP, atau TBT) wajib mempertahankan dan mematuhi aturan keamanan berikut:

1. **Variabel Lingkungan Sensitif**: Jangan pernah mengubah variabel lingkungan sensitif menjadi `NEXT_PUBLIC_` demi kemudahan akses klien.
2. **Middleware / Proxy Security**: Optimasi file `proxy.js` (atau middleware) tidak boleh melonggarkan proteksi rute autentikasi atau bypass URL.
3. **Cache-Control & Data Privasi**: Penggunaan caching atau CDN header tidak boleh membocorkan data pribadi user (ikuti aturan `Cache-Control: private, no-cache, no-store, must-revalidate` atau data-level isolation).
4. **Content Security Policy (CSP)**: Setiap penghentian blocking script tidak boleh menonaktifkan kebijakan Content Security Policy (CSP) yang ketat.
5. **Pemindaian Keamanan Internal**: Jalankan pemindaian celah keamanan internal (regresi siber) otomatis (seperti pengetesan/analisis statis atau verifikasi header via curl) setiap kali selesai memperbarui kode untuk memastikan tidak ada celah keamanan baru yang tercipta.
