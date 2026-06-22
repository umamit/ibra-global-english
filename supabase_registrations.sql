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

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Policy: siapa pun bisa insert pendaftaran baru (dari landing page)
DROP POLICY IF EXISTS "Public can insert registrations" ON public.registrations;
CREATE POLICY "Public can insert registrations"
  ON public.registrations
  FOR INSERT
  WITH CHECK (true);

-- Policy: admin bisa melihat dan mengelola semua pendaftaran
DROP POLICY IF EXISTS "Admin full access to registrations" ON public.registrations;
CREATE POLICY "Admin full access to registrations"
  ON public.registrations
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy: service role bisa semua operasi (untuk server-side)
DROP POLICY IF EXISTS "Service role full access to registrations" ON public.registrations;
CREATE POLICY "Service role full access to registrations"
  ON public.registrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);