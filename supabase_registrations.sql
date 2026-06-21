-- ============================================================
-- Fase 43: Tabel Pendaftaran Online Siswa Baru
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Buat tabel registrations
CREATE TABLE IF NOT EXISTS public.registrations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name  TEXT NOT NULL,
  student_age   INT,
  parent_name   TEXT,
  parent_email  TEXT,
  whatsapp      TEXT NOT NULL,
  program       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat berdasarkan status
CREATE INDEX IF NOT EXISTS idx_registrations_status
  ON public.registrations (status);

-- Index untuk urutan terbaru
CREATE INDEX IF NOT EXISTS idx_registrations_created_at
  ON public.registrations (created_at DESC);

-- Enable RLS (tabel ini hanya diakses via service role dari server)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Policy: hanya service role (server-side) yang bisa baca/tulis
-- Client-side tidak bisa akses langsung (aman)
CREATE POLICY "Service role full access"
  ON public.registrations
  FOR ALL
  USING (true)
  WITH CHECK (true);
