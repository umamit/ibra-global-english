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
TO authenticated
WITH CHECK (bucket_id = 'lms-files');

DROP POLICY IF EXISTS "Authenticated Manage - lms-files" ON storage.objects;
CREATE POLICY "Authenticated Manage - lms-files"
ON storage.objects FOR ALL
TO authenticated
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

-- Semua pengguna terautentikasi (siswa, orang tua, tutor, admin) bisa melihat materi/tugas
DROP POLICY IF EXISTS "Authenticated can view lms_materials" ON public.lms_materials;
CREATE POLICY "Authenticated can view lms_materials" ON public.lms_materials
  FOR SELECT TO authenticated USING (true);

-- Hanya Admin dan Tutor yang bisa menambah/mengubah/menghapus materi/tugas
DROP POLICY IF EXISTS "Admin/Tutor modify lms_materials" ON public.lms_materials;
CREATE POLICY "Admin/Tutor modify lms_materials" ON public.lms_materials
  FOR ALL TO authenticated
  USING (public.is_admin_or_tutor())
  WITH CHECK (public.is_admin_or_tutor());


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

-- Setiap user bisa melihat submission miliknya (siswa), admin, atau tutor
DROP POLICY IF EXISTS "View own or admin/tutor lms_submissions" ON public.lms_submissions;
CREATE POLICY "View own or admin/tutor lms_submissions" ON public.lms_submissions
  FOR SELECT TO authenticated USING (
    -- Admin dan tutor bisa melihat semua submission
    public.is_admin_or_tutor()
    OR
    -- Siswa bisa melihat submission mereka sendiri
    student_id IN (
      SELECT id FROM public.students WHERE id = lms_submissions.student_id
    )
    OR
    -- Orang tua bisa melihat submission anaknya
    student_id IN (
      SELECT id FROM public.students WHERE parent_id = auth.uid()
    )
  );

-- Hanya Admin dan Tutor yang bisa memberi nilai/umpan balik (UPDATE)
DROP POLICY IF EXISTS "Admin/Tutor grade lms_submissions" ON public.lms_submissions;
CREATE POLICY "Admin/Tutor grade lms_submissions" ON public.lms_submissions
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_tutor())
  WITH CHECK (public.is_admin_or_tutor());

-- Siswa (atau siapa pun) bisa mengumpulkan submission (INSERT)
DROP POLICY IF EXISTS "Authenticated can submit lms_submissions" ON public.lms_submissions;
CREATE POLICY "Authenticated can submit lms_submissions" ON public.lms_submissions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Hanya Admin yang bisa menghapus submission
DROP POLICY IF EXISTS "Admin delete lms_submissions" ON public.lms_submissions;
CREATE POLICY "Admin delete lms_submissions" ON public.lms_submissions
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Indeks untuk performa query
CREATE INDEX IF NOT EXISTS idx_lms_submissions_student_id ON public.lms_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_lms_submissions_material_id ON public.lms_submissions(material_id);
CREATE INDEX IF NOT EXISTS idx_lms_materials_program ON public.lms_materials(program);