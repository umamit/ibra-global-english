-- Migration / Setup: Tabel promo_banners & Storage Bucket
-- Jalankan di Supabase Dashboard -> SQL Editor jika tabel belum ada atau butuh verifikasi kolom

CREATE TABLE IF NOT EXISTS public.promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_text TEXT DEFAULT 'PROMO KHUSUS',
  title TEXT DEFAULT '',
  message TEXT DEFAULT '',
  image_url TEXT,
  cta_text TEXT DEFAULT '',
  cta_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk mempercepat query banner aktif
CREATE INDEX IF NOT EXISTS idx_promo_banners_active ON public.promo_banners (is_active, created_at DESC);

-- Enable RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- Kebijakan SELECT untuk publik (pengunjung website)
DROP POLICY IF EXISTS "Public can view active promo banners" ON public.promo_banners;
CREATE POLICY "Public can view active promo banners"
ON public.promo_banners FOR SELECT
USING (is_active = TRUE);

-- Kebijakan ALL untuk service role / admin
DROP POLICY IF EXISTS "Service role can manage promo banners" ON public.promo_banners;
CREATE POLICY "Service role can manage promo banners"
ON public.promo_banners FOR ALL
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Storage Bucket untuk gambar promo
INSERT INTO storage.buckets (id, name, public)
VALUES ('promo-images', 'promo-images', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan Storage agar publik bisa melihat gambar
DROP POLICY IF EXISTS "Public can view promo images" ON storage.objects;
CREATE POLICY "Public can view promo images"
ON storage.objects FOR SELECT
USING (bucket_id = 'promo-images');

-- Kebijakan Storage agar authenticated/admin bisa upload gambar
DROP POLICY IF EXISTS "Authenticated can upload promo images" ON storage.objects;
CREATE POLICY "Authenticated can upload promo images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'promo-images');
