-- =====================================================================
-- IBRA GLOBAL ENGLISH - ADD TUTORS AND CURRICULUMS TABLES
-- =====================================================================
-- Jalankan skrip SQL ini di Supabase SQL Editor.

-- 1. TABEL: tutors (Profil Pengajar / Staf)
CREATE TABLE IF NOT EXISTS public.tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- Contoh: "Head Tutor", "Calistung Specialist"
  bio TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL: curriculums (Silabus / Materi Kurikulum)
CREATE TABLE IF NOT EXISTS public.curriculums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program TEXT NOT NULL CHECK (program IN ('Kids Program', 'Teens Program', 'Fun Calistung')),
  level_name TEXT NOT NULL, -- Contoh: "Basic 1", "Intermediate"
  duration TEXT DEFAULT '', -- Contoh: "3 Bulan / 24 Pertemuan"
  topics JSONB DEFAULT '[]'::jsonb, -- Menyimpan array string topik pembelajaran
  syllabus_pdf_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculums ENABLE ROW LEVEL SECURITY;

-- 4. KEBIJAKAN RLS UNTUK TABEL: tutors
DROP POLICY IF EXISTS "Public select active tutors" ON public.tutors;
CREATE POLICY "Public select active tutors"
ON public.tutors FOR SELECT
USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admin full access tutors" ON public.tutors;
CREATE POLICY "Admin full access tutors"
ON public.tutors FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. KEBIJAKAN RLS UNTUK TABEL: curriculums
DROP POLICY IF EXISTS "Public select active curriculums" ON public.curriculums;
CREATE POLICY "Public select active curriculums"
ON public.curriculums FOR SELECT
USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admin full access curriculums" ON public.curriculums;
CREATE POLICY "Admin full access curriculums"
ON public.curriculums FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. INDEKS UNTUK OPTIMISASI KINERJA
CREATE INDEX IF NOT EXISTS idx_tutors_is_active_order ON public.tutors(is_active, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_curriculums_program_active ON public.curriculums(program, is_active);
