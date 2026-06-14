-- Pembaruan Tabel Certificates untuk Integrasi Canva & Nomor Dinas Pendidikan
-- Jalankan skrip ini di SQL Editor Supabase Anda.

ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS cert_number TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS custom_image_url TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE;
