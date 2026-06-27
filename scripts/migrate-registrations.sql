-- Migration: Ensure registrations table exists in production
-- Jalankan di Supabase SQL Editor atau via CI/CD sebelum deploy

CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_age INT,
  parent_name TEXT,
  parent_email TEXT,
  whatsapp TEXT NOT NULL,
  program TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations (created_at DESC);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert registrations" ON public.registrations;
CREATE POLICY "Public can insert registrations"
  ON public.registrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to registrations" ON public.registrations;
CREATE POLICY "Admins have full access to registrations"
  ON public.registrations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Service role full access to registrations" ON public.registrations;
CREATE POLICY "Service role full access to registrations"
  ON public.registrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
