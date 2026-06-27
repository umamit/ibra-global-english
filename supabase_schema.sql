-- =====================================================================
-- IBRA GLOBAL ENGLISH BOBONG - DATABASE SCHEMA MIGRATION
-- =====================================================================
-- Jalankan skrip SQL ini di Supabase SQL Editor untuk menginisialisasi
-- basis data yang diperlukan untuk portal Admin dan Orang Tua.

-- =====================================================================
-- 1. PEMBUATAN TABEL-TABEL UTAMA
-- =====================================================================

-- TABEL: profiles (Profil Pengguna)
-- Menampung peran pengguna (admin/parent) yang terhubung dengan Supabase Auth.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'parent', 'tutor', 'student')),
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABEL: students (Data Siswa)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 100),
  program TEXT NOT NULL CHECK (program IN ('Kids Program', 'Teens Program', 'Fun Calistung')),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABEL: attendance (Absensi Harian)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alfa', 'tidak_ada_kelas')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_student_attendance_per_day UNIQUE (student_id, date)
);

-- TABEL: reports (Rapor Belajar Digital)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  speaking_score INTEGER NOT NULL CHECK (speaking_score >= 0 AND speaking_score <= 100),
  grammar_score INTEGER NOT NULL CHECK (grammar_score >= 0 AND grammar_score <= 100),
  vocabulary_score INTEGER NOT NULL CHECK (vocabulary_score >= 0 AND vocabulary_score <= 100),
  active_score INTEGER NOT NULL CHECK (active_score >= 0 AND active_score <= 100),
  tutor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- 2. OTOMATISASI DAN TRIGGER (PROFILE CREATION)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role TEXT := 'parent';
  full_name_val TEXT;
BEGIN
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    default_role := new.raw_user_meta_data->>'role';
  END IF;

  IF new.raw_user_meta_data->>'full_name' IS NOT NULL THEN
    full_name_val := new.raw_user_meta_data->>'full_name';
  ELSE
    full_name_val := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  END IF;

  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new.id, full_name_val, default_role, new.email);

  UPDATE auth.users 
  SET email_confirmed_at = COALESCE(email_confirmed_at, now()) 
  WHERE id = new.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 2b. KEAMANAN SECURITY DEFINER (Helper Functions)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_tutor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'tutor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_tutor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'tutor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id);

-- students
CREATE POLICY "Admins have full access to students" 
ON public.students FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Tutors can view all students" 
ON public.students FOR SELECT TO authenticated 
USING (public.is_tutor());

CREATE POLICY "Parents can view their own students" 
ON public.students FOR SELECT TO authenticated 
USING (parent_id = auth.uid());

-- attendance
CREATE POLICY "Admins have full access to attendance" 
ON public.attendance FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Tutors have full access to attendance" 
ON public.attendance FOR ALL TO authenticated 
USING (public.is_tutor()) WITH CHECK (public.is_tutor());

CREATE POLICY "Parents can view their own children attendance" 
ON public.attendance FOR SELECT TO authenticated 
USING (student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()));

-- reports
CREATE POLICY "Admins have full access to reports" 
ON public.reports FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Tutors have full access to reports" 
ON public.reports FOR ALL TO authenticated 
USING (public.is_tutor()) WITH CHECK (public.is_tutor());

CREATE POLICY "Parents can view their own children reports" 
ON public.reports FOR SELECT TO authenticated 
USING (student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()));

-- =====================================================================
-- 4. INDEKS
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_reports_student_id ON public.reports(student_id);

-- =====================================================================
-- 5. TABEL CMS LANDING PAGE
-- =====================================================================

-- landing_settings (Konfigurasi Landing Page)
CREATE TABLE IF NOT EXISTS public.landing_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- gallery_items (Galeri Foto - nama tabel konsisten dengan kode aplikasi)
-- NOTE: Aplikasi menggunakan tabel gallery_items (bukan gallery).
-- Jika Anda memiliki tabel lama bernama "gallery", migrasikan data ke sini.
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  storage_path TEXT DEFAULT '',
  category TEXT DEFAULT 'Kegiatan',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.landing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- landing_settings
CREATE POLICY "Allow public read access to landing_settings" 
ON public.landing_settings FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to landing_settings" 
ON public.landing_settings FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- testimonials
CREATE POLICY "Allow public read access to testimonials" 
ON public.testimonials FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to testimonials" 
ON public.testimonials FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- gallery_items
CREATE POLICY "Allow public read access to gallery_items" 
ON public.gallery_items FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Allow admin full access to gallery_items" 
ON public.gallery_items FOR ALL TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_gallery_items_active ON public.gallery_items(is_active, display_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);

-- =====================================================================
-- 6. TABEL KEUANGAN, TES PENEMPATAN, & JADWAL
-- =====================================================================

-- tuition_payments
CREATE TABLE IF NOT EXISTS public.tuition_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 150000,
  status TEXT NOT NULL DEFAULT 'belum_bayar' CHECK (status IN ('lunas', 'belum_bayar', 'menunggu_konfirmasi')),
  payment_method TEXT CHECK (payment_method IN ('Transfer Bank', 'Tunai', 'Lainnya')),
  receipt_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_student_payment_per_month UNIQUE (student_id, month)
);

-- placement_test_submissions
CREATE TABLE IF NOT EXISTS public.placement_test_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  score INTEGER NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'enrolled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- placement_test_questions
CREATE TABLE IF NOT EXISTS public.placement_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  is_audio BOOLEAN DEFAULT false,
  audio_text TEXT,
  is_speaking BOOLEAN DEFAULT false,
  target_sentence TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Dummy seed if empty (for initial production run)
INSERT INTO public.placement_test_questions (category, question, options, is_audio, audio_text, is_speaking, target_sentence, order_index)
SELECT
  'Grammar (A1 Easy)',
  'She ________ her breakfast at 7 AM every day.',
  '[{"text":"eat","score":0},{"text":"eats","score":1},{"text":"eating","score":0},{"text":"eaten","score":0}]',
  false, null, false, null, 1
WHERE NOT EXISTS (SELECT 1 FROM public.placement_test_questions LIMIT 1);

-- placement_test_regenerate_logs (history logging)
CREATE TABLE IF NOT EXISTS public.placement_test_regenerate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT,
  category TEXT,
  target_id UUID,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  old_question TEXT,
  new_question TEXT,
  ai_raw_response TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- registrations (pendaftaran online siswa baru)
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_age INT,
  parent_name TEXT,
  parent_email TEXT,
  whatsapp TEXT NOT NULL,
  program TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations (created_at DESC);

-- academic_schedules
CREATE TABLE IF NOT EXISTS public.academic_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('class', 'event', 'holiday')),
  program TEXT DEFAULT 'All' CHECK (program IN ('Kids Program', 'Teens Program', 'Fun Calistung', 'All')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  instructor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tuition_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_schedules ENABLE ROW LEVEL SECURITY;

-- tuition_payments RLS
CREATE POLICY "Admins have full access to tuition_payments"
ON public.tuition_payments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Parents can view their children payments"
ON public.tuition_payments FOR SELECT TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can insert payment receipts for their children"
ON public.tuition_payments FOR INSERT TO authenticated
WITH CHECK (student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()));

-- placement_test_submissions RLS
CREATE POLICY "Allow anyone to insert placement test submissions"
ON public.placement_test_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to placement_test_submissions"
ON public.placement_test_submissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- placement_test_questions RLS
CREATE POLICY "Anyone can view active placement test questions"
ON public.placement_test_questions FOR SELECT USING (true);

CREATE POLICY "Admins have full access to placement_test_questions"
ON public.placement_test_questions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- placement_test_regenerate_logs RLS
CREATE POLICY "Admins have full access to placement_test_regenerate_logs"
ON public.placement_test_regenerate_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- registrations RLS (pendaftaran online)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert registrations"
ON public.registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to registrations"
ON public.registrations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Service role full access to registrations"
ON public.registrations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- academic_schedules RLS
CREATE POLICY "Admins have full access to academic_schedules"
ON public.academic_schedules FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Allow authenticated users to view academic schedules"
ON public.academic_schedules FOR SELECT TO authenticated USING (true);

-- Indeks Tambahan
CREATE INDEX IF NOT EXISTS idx_tuition_payments_student_id ON public.tuition_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_schedules_start_time ON public.academic_schedules(start_time);
CREATE INDEX IF NOT EXISTS idx_placement_test_status ON public.placement_test_submissions(status, created_at DESC);

-- =====================================================================
-- 7. STORAGE BUCKETS
-- =====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('gallery-photos', 'gallery-photos', true),
  ('gallery-uploads', 'gallery-uploads', true),
  ('spp-receipts', 'spp-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- gallery-photos bucket (digunakan oleh API /api/gallery)
DROP POLICY IF EXISTS "Public Access - gallery-photos" ON storage.objects;
CREATE POLICY "Public Access - gallery-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-photos');

DROP POLICY IF EXISTS "Admin Upload - gallery-photos" ON storage.objects;
CREATE POLICY "Admin Upload - gallery-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery-photos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete - gallery-photos" ON storage.objects;
CREATE POLICY "Admin Delete - gallery-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery-photos' AND public.is_admin());

-- gallery-uploads bucket (backup/cadangan)
DROP POLICY IF EXISTS "Public Access - gallery-uploads" ON storage.objects;
CREATE POLICY "Public Access - gallery-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-uploads');

DROP POLICY IF EXISTS "Admin Upload - gallery-uploads" ON storage.objects;
CREATE POLICY "Admin Upload - gallery-uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery-uploads' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete - gallery-uploads" ON storage.objects;
CREATE POLICY "Admin Delete - gallery-uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery-uploads' AND public.is_admin());

-- spp-receipts bucket
DROP POLICY IF EXISTS "Public Access - spp-receipts" ON storage.objects;
CREATE POLICY "Public Access - spp-receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'spp-receipts');

DROP POLICY IF EXISTS "Authenticated Upload - spp-receipts" ON storage.objects;
CREATE POLICY "Authenticated Upload - spp-receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'spp-receipts');

DROP POLICY IF EXISTS "Admin Delete - spp-receipts" ON storage.objects;
CREATE POLICY "Admin Delete - spp-receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'spp-receipts' AND public.is_admin());

-- =====================================================================
-- Catatan Penting untuk Administrator:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'UUID_AKUN_ANDA';
-- =====================================================================

-- =====================================================================
-- INOVASI FASE 22 - SCHEMA UPDATES (Rewards, Certificates)
-- =====================================================================

-- student_rewards (Gamification)
CREATE TABLE IF NOT EXISTS public.student_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.student_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select student_rewards" ON public.student_rewards
  FOR SELECT USING (true);

CREATE POLICY "Admin/Tutor modify student_rewards" ON public.student_rewards
  FOR ALL TO authenticated
  USING (public.is_admin_or_tutor())
  WITH CHECK (public.is_admin_or_tutor());

-- certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tutor_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select certificates" ON public.certificates
  FOR SELECT USING (true);

CREATE POLICY "Admin modify certificates" ON public.certificates
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Indeks
CREATE INDEX IF NOT EXISTS idx_student_rewards_student_id ON public.student_rewards(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates(student_id);