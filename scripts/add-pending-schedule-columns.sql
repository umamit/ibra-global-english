-- Tambahkan kolom status, pending_reason, dan rescheduled_to ke tabel academic_schedules
ALTER TABLE academic_schedules 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS pending_reason TEXT,
ADD COLUMN IF NOT EXISTS rescheduled_to TIMESTAMPTZ;

-- Hapus check constraint lama pada kolom program agar mendukung semua level CEFR dan Matematika Dasar
ALTER TABLE academic_schedules
DROP CONSTRAINT IF EXISTS academic_schedules_program_check;

-- Tambahkan kolom yang sama ke tabel online_schedules jika belum ada
ALTER TABLE online_schedules 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS pending_reason TEXT,
ADD COLUMN IF NOT EXISTS rescheduled_to TIMESTAMPTZ;
