-- ==========================================================================
-- IBRA GLOBAL ENGLISH — SKRIP SELESAI PEMBUATAN TABEL SURAT RESMI (SUPABASE)
-- Jalankan kode ini di SQL Editor Supabase Anda untuk mengaktifkan modul Surat.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.official_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    letter_number TEXT NOT NULL,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sender_name TEXT NOT NULL DEFAULT 'Husnita Usman, M.Pd.',
    sender_role TEXT NOT NULL DEFAULT 'Direktur',
    lampiran TEXT NOT NULL DEFAULT '-',
    attachment TEXT NOT NULL DEFAULT '',
    letter_date TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indeks opsional untuk meningkatkan kecepatan pencarian judul
CREATE INDEX IF NOT EXISTS official_letters_title_idx ON public.official_letters (title);
CREATE INDEX IF NOT EXISTS official_letters_created_at_idx ON public.official_letters (created_at DESC);

-- Muat ulang schema cache PostgREST agar tabel langsung terdeteksi
NOTIFY pgrst, 'reload schema';
