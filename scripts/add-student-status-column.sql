-- Migration: Add status column to students table
-- Copy and paste this script into Supabase Dashboard -> SQL Editor -> Run

ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'aktif';

ALTER TABLE public.students
DROP CONSTRAINT IF EXISTS check_student_status;

ALTER TABLE public.students
ADD CONSTRAINT check_student_status 
CHECK (status IN ('aktif', 'cuti', 'alumnus', 'non_aktif'));

CREATE INDEX IF NOT EXISTS idx_students_status ON public.students (status);
