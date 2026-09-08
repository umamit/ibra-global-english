-- ==============================================================================
-- MIGRASI TABEL CATATAN PERTEMUAN SISWA (student_session_notes)
-- Jalankan skrip ini di SQL Editor Dasbor Supabase Anda (https://supabase.com)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.student_session_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meeting_number INT,
  topic_covered TEXT NOT NULL,
  vocabulary_learned TEXT,
  comprehension_level VARCHAR(30) DEFAULT 'Baik',
  student_behavior VARCHAR(50),
  individual_feedback TEXT NOT NULL,
  homework_assigned TEXT,
  created_by_role VARCHAR(20) NOT NULL DEFAULT 'admin',
  tutor_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks performa
CREATE INDEX IF NOT EXISTS idx_session_notes_student ON public.student_session_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_date ON public.student_session_notes(session_date DESC);

-- Row Level Security
ALTER TABLE public.student_session_notes ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS
CREATE POLICY "Allow public read session notes" 
ON public.student_session_notes FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow service role full access" 
ON public.student_session_notes FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
