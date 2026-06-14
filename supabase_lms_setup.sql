-- =====================================================================
-- MODUL LMS MINI - DATABASE & STORAGE SCHEMA SETUP
-- Jalankan skrip ini di SQL Editor Supabase Anda.
-- =====================================================================

-- 1. Buat Storage Bucket untuk LMS jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('lms-files', 'lms-files', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan RLS untuk Storage Bucket 'lms-files'
DROP POLICY IF EXISTS "Public Access - lms-files" ON storage.objects;
CREATE POLICY "Public Access - lms-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'lms-files');

DROP POLICY IF EXISTS "Authenticated Upload - lms-files" ON storage.objects;
CREATE POLICY "Authenticated Upload - lms-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lms-files');

DROP POLICY IF EXISTS "Authenticated Manage - lms-files" ON storage.objects;
CREATE POLICY "Authenticated Manage - lms-files"
ON storage.objects FOR ALL
USING (bucket_id = 'lms-files')
WITH CHECK (bucket_id = 'lms-files');


-- 2. Buat tabel lms_materials (Materi & Tugas dari Tutor)
CREATE TABLE IF NOT EXISTS public.lms_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  program TEXT NOT NULL, -- 'Kids Program', 'Teens Program', 'Fun Calistung'
  type TEXT NOT NULL, -- 'materi', 'tugas'
  file_url TEXT, -- URL file materi/soal
  due_date TIMESTAMP WITH TIME ZONE, -- Hanya untuk tipe 'tugas'
  tutor_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS untuk lms_materials
ALTER TABLE public.lms_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select lms_materials" ON public.lms_materials;
CREATE POLICY "Public select lms_materials" ON public.lms_materials
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "All modify lms_materials" ON public.lms_materials;
CREATE POLICY "All modify lms_materials" ON public.lms_materials
  FOR ALL USING (true) WITH CHECK (true);


-- 3. Buat tabel lms_submissions (Pengumpulan Tugas dari Siswa)
CREATE TABLE IF NOT EXISTS public.lms_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.lms_materials(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL, -- URL file jawaban siswa
  grade TEXT, -- Nilai (misal: "85", "A", dll)
  feedback TEXT, -- Catatan umpan balik tutor
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_student_material UNIQUE (material_id, student_id)
);

-- RLS untuk lms_submissions
ALTER TABLE public.lms_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select lms_submissions" ON public.lms_submissions;
CREATE POLICY "Public select lms_submissions" ON public.lms_submissions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "All modify lms_submissions" ON public.lms_submissions;
CREATE POLICY "All modify lms_submissions" ON public.lms_submissions
  FOR ALL USING (true) WITH CHECK (true);
