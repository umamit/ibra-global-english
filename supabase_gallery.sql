-- B3: Tabel gallery_items untuk Galeri Foto Kegiatan
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,           -- URL dari Supabase Storage
  storage_path TEXT DEFAULT '',      -- Path internal storage untuk hapus file
  category TEXT DEFAULT 'Kegiatan', -- 'Kegiatan', 'Prestasi', 'Fasilitas', 'Kelas Online'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Policy: semua orang (termasuk public) bisa baca galeri aktif
CREATE POLICY "Public bisa baca galeri aktif"
ON gallery_items FOR SELECT
TO public
USING (is_active = TRUE);

-- Policy: service role bisa semua operasi
CREATE POLICY "Service role bisa semua operasi di gallery_items"
ON gallery_items FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Index
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery_items(is_active, display_order, created_at DESC);

-- Buat bucket storage untuk galeri (jalankan juga di Storage section Supabase)
-- Bucket name: gallery-photos
-- Public: YES (agar gambar bisa ditampilkan tanpa auth)
