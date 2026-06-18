-- B2: Tabel online_schedules untuk Jadwal Kelas Online
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS online_schedules (
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
ALTER TABLE online_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated user bisa baca jadwal aktif yang akan datang
CREATE POLICY "Authenticated users bisa baca jadwal online aktif"
ON online_schedules FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- Policy: service role bisa semua operasi
CREATE POLICY "Service role bisa semua operasi di online_schedules"
ON online_schedules FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Index
CREATE INDEX IF NOT EXISTS idx_online_schedules_active ON online_schedules(is_active, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_online_schedules_program ON online_schedules(program, scheduled_at);
