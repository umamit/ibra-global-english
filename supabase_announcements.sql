-- B1: Tabel announcements untuk fitur Pengumuman & Broadcast
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  program TEXT DEFAULT 'Semua Program', -- 'Semua Program', 'Kids Program', 'Teens Program', 'Fun Calistung'
  priority TEXT DEFAULT 'normal', -- 'normal', 'penting', 'urgent'
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NULL, -- NULL = tidak ada kadaluarsa
  created_by TEXT DEFAULT 'Admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: semua authenticated user bisa baca pengumuman aktif
CREATE POLICY "Semua user bisa baca pengumuman aktif"
ON announcements FOR SELECT
TO authenticated
USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Policy: service role bisa semua operasi (untuk admin via API)
CREATE POLICY "Service role bisa semua operasi di announcements"
ON announcements FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_program ON announcements(program);

-- Contoh data awal
INSERT INTO announcements (title, content, program, priority) VALUES
  ('Selamat Datang di Portal Ibra Global English!', 'Kami dengan bangga memperkenalkan portal digital Ibra Global English. Di sini Anda dapat memantau progress belajar, mengakses materi LMS, dan berkomunikasi dengan tim pengajar kami. Selamat belajar! 🎉', 'Semua Program', 'normal');
