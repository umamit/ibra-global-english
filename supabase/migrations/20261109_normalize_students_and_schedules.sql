-- 20261109_normalize_students_and_schedules.sql
-- Tahap 1 & 2: Normalisasi skema students (student_code, parent info, billing_cycle) & relasi student_id pada academic_schedules

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_code TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'prepaid';

UPDATE public.students
SET student_code = 'IGE-' || UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 6))
WHERE student_code IS NULL OR student_code = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_student_code ON public.students (student_code);

UPDATE public.students
SET billing_cycle = CASE
  WHEN LOWER(name) ~ '\y(athira|firman|syafa|yunda|akhtar|syauqi|nasya)\y' THEN 'postpaid'
  ELSE COALESCE(billing_cycle, 'prepaid')
END
WHERE billing_cycle IS NULL OR billing_cycle = 'prepaid';

ALTER TABLE public.academic_schedules ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.students(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_academic_schedules_student_id ON public.academic_schedules (student_id);
