-- B2: Tabel online_schedules untuk Jadwal Kelas Online
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.online_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,                          -- Contoh: "Sesi Speaking Practice"
  program TEXT NOT NULL,                        -- 'Kids Program', 'Teens Program', 'Fun Calistung'
  meeting_link TEXT NOT NULL,                   -- Google Meet / Zoom URL
  meeting_platform TEXT DEFAULT 'Google Meet',  -- 'Google Meet', 'Zoom', 'Webex'
  scheduled_at TIMESTAMPTZ NOT NULL,            -- Tanggal & jam kelas
  duration_minutes INTEGER DEFAULT 60,          -- Durasi dalam menit
  tutor_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.online_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated user bisa baca jadwal aktif yang akan datang
CREATE POLICY "Authenticated users bisa baca jadwal online aktif"
ON public.online_schedules FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- Policy: Admin bisa semua operasi (CRUD jadwal online)
DROP POLICY IF EXISTS "Admin full access to online_schedules" ON public.online_schedules;
CREATE POLICY "Admin full access to online_schedules"
ON public.online_schedules FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Index
CREATE INDEX IF NOT EXISTS idx_online_schedules_active ON public.online_schedules(is_active, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_online_schedules_program ON public.online_schedules(program, scheduled_at);