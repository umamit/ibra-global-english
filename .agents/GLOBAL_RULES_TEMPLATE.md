# 🌐 Standard Antigravity Global IDE Rules & Maintenance Utilities

Dokumen ini berisi panduan dan utilitas standar global yang dapat digunakan kembali untuk setiap proyek baru di Antigravity IDE.

---

## 📋 1. Template Aturan Global (`GLOBAL_SYSTEM_RULES.md`)
Aturan dasar di bawah ini dirancang untuk diikutsertakan pada setiap proyek web enterprise baru:

1. **Autocleanup Server Lokal:**
   Setiap kali server dev dijalankan (misal `npm run dev`), pastikan untuk mematikannya (`npx kill-port 3000`) setelah verifikasi selesai.
2. **0 Emoji UI Rule:**
   Seluruh antarmuka web, teks UI, dan komponen wajib menggunakan SVG/Lucide icons murni tanpa emoji.
3. **Isolasi CSS Modules (Maksimal 300 Baris):**
   Gunakan file `[Component].module.css` terisolasi untuk mencegah kepecahan layout global.
4. **Batas Panjang Kode Aplikasi (Maksimal 800 Baris):**
   File `.tsx`, `.ts`, `.jsx`, `.js`, dan `.css` tidak boleh melebihi 800 baris.
5. **Verifikasi Pre-Commit:**
   Selalu jalankan audit kode (scan emoji, lint, build) sebelum melakukan commit & push ke GitHub.

---

## 🛠️ 2. Alat Bantu Audit & Maintenance

### A. Skrip Pembersih Server Dev Lokal
```bash
npx kill-port 3000 3001 5000 8080
```

### B. Skrip Inspeksi Kebersihan Emoji (Terminal-Only)
```bash
python3 -c "
import os, re
emoji_pattern = re.compile(
    r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF'
    r'\U0001F680-\U0001F6FF\U0001F1E6-\U0001F1FF'
    r'\U0001F900-\U0001F9FF\U0001FA70-\U0001FAFF'
    r'\u2600-\u26FF\u2700-\u27BF\u2300-\u23FF]'
)
matches = []
for root, dirs, files in os.walk('./src'):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    for idx, line in enumerate(f.readlines(), 1):
                        found = emoji_pattern.findall(line)
                        if found:
                            matches.append((filepath, idx, ''.join(set(found)), line.strip()))
            except: pass
print(f'Total emoji occurrences found across src/: {len(matches)}')
"
```
