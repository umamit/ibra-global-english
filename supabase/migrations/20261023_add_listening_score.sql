-- ==============================================================================
-- MIGRASI PENAMBAHAN KOLOM SKOR LISTENING PADA TABEL RAPOR (reports)
-- Jalankan skrip ini di SQL Editor Dasbor Supabase Anda (https://supabase.com)
-- ==============================================================================

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS listening_score INT DEFAULT 85;
