-- ============================================================
-- MIGRASI GALERI: Tambahan Kolom & Migrasi gallery → gallery_items
-- ============================================================
--
-- CATATAN PENTING:
-- Aplikasi menggunakan tabel "gallery_items" (bukan "gallery").
-- Tabel "gallery_items" sudah didefinisikan di supabase_schema.sql.
--
-- Jika Anda sebelumnya menjalankan supabase_schema.sql versi LAMA
-- yang membuat tabel "public.gallery", gunakan skrip ini untuk:
-- 1. Menambahkan kolom baru ke gallery_items
-- 2. Memigrasikan data dari gallery → gallery_items
-- 3. (Opsional) Menghapus tabel gallery lama
-- ============================================================

-- 1. Tambahkan kolom tambahan ke gallery_items (jika belum ada)
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS storage_path TEXT DEFAULT '';
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Kegiatan';
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Perbarui RLS policy untuk gallery_items
-- Pastikan policy yang benar ada
DROP POLICY IF EXISTS "Allow public read access to gallery_items" ON public.gallery_items;
CREATE POLICY "Allow public read access to gallery_items" 
ON public.gallery_items FOR SELECT 
USING (is_active = TRUE);

-- 3. Buat index untuk performa query galeri aktif
CREATE INDEX IF NOT EXISTS idx_gallery_items_active ON public.gallery_items(is_active, display_order, created_at DESC);

-- ============================================================
-- MIGRASI DATA: gallery → gallery_items (Jika Tabel gallery Ada)
-- ============================================================
-- Jalankan jika Anda memiliki data di tabel "gallery" lama:
--
-- INSERT INTO public.gallery_items (title, description, image_url, storage_path, category, display_order, is_active)
-- SELECT title, description, image_url, '', 'Kegiatan', 0, true
-- FROM public.gallery
-- WHERE image_url IS NOT NULL AND image_url != '';
--
-- SETELAH data termigrasi, verifikasi dulu, lalu hapus tabel lama:
-- DROP TABLE IF EXISTS public.gallery;

-- ============================================================
-- CATATAN STORAGE BUCKET
-- ============================================================
-- Bucket storage untuk galeri: gallery-photos
-- (SUDAH dibuat di supabase_schema.sql bagian 7)