-- =====================================================================
-- IBRA GLOBAL ENGLISH BOBONG - DATABASE SCHEMA MIGRATION
-- =====================================================================
-- Jalankan skrip SQL ini di Supabase SQL Editor untuk menginisialisasi
-- basis data yang diperlukan untuk portal Admin dan Orang Tua.

-- Nonaktifkan sementara kebijakan keamanan agar proses setup lancar (opsional)
-- SET check_function_bodies = false;

-- =====================================================================
-- 1. PEMBUATAN TABEL-TABEL UTAMA
-- =====================================================================

-- TABEL: profiles (Profil Pengguna)
-- Menampung peran pengguna (admin/parent) yang terhubung dengan Supabase Auth.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'parent')),
  email TEXT, -- Menyimpan alamat email pendaftar untuk memudahkan Admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABEL: students (Data Siswa)
-- Menyimpan informasi siswa yang terdaftar di bimbingan belajar.
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 100),
  program TEXT NOT NULL CHECK (program IN ('Kids Program', 'Teens Program', 'Fun Calistung')),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABEL: attendance (Absensi Harian)
-- Mencatat kehadiran siswa pada setiap pertemuan kelas harian.
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alfa')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Mencegah pencatatan absensi ganda untuk siswa yang sama di hari yang sama
  CONSTRAINT unique_student_attendance_per_day UNIQUE (student_id, date)
);

-- TABEL: reports (Rapor Belajar Digital / Rapor Modul)
-- Menyimpan nilai akademis, evaluasi sub-kemampuan, dan catatan tutor.
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL, -- Contoh: "Module 1 - Basic Greeting"
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

-- Fungsi trigger untuk otomatis menyisipkan record ke public.profiles
-- saat pengguna baru mendaftar (signup) di Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role TEXT := 'parent';
  full_name_val TEXT;
BEGIN
  -- Dapatkan peran default dari metadata pengguna jika dikirim saat registrasi
  IF new.raw_user_meta_data ? 'role' THEN
    default_role := new.raw_user_meta_data->>'role';
  END IF;

  -- Cari nama lengkap dari metadata, atau gunakan bagian email jika kosong
  IF new.raw_user_meta_data ? 'full_name' THEN
    full_name_val := new.raw_user_meta_data->>'full_name';
  ELSE
    full_name_val := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  END IF;

  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id,
    full_name_val,
    default_role,
    new.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pada tabel auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 2b. KEAMANAN SECURITY DEFINER (Mencegah Infinite Recursion)
-- =====================================================================

-- Fungsi pembantu untuk mengecek apakah pengguna aktif adalah admin.
-- Ditandai dengan SECURITY DEFINER agar berjalan melewati RLS tabel profiles,
-- sehingga menghindari bug "infinite recursion" pada PostgreSQL.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- KEBIJAKAN UNTUK TABEL: profiles
-- Admin memiliki akses penuh.
CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Pengguna terautentikasi dapat membaca profil mereka sendiri.
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Pengguna terautentikasi dapat memperbarui profil mereka sendiri.
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);


-- KEBIJAKAN UNTUK TABEL: students
-- Admin memiliki akses penuh.
CREATE POLICY "Admins have full access to students" 
ON public.students FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Orang Tua dapat membaca data siswa yang merupakan anak mereka (parent_id cocok).
CREATE POLICY "Parents can view their own students" 
ON public.students FOR SELECT 
TO authenticated 
USING (parent_id = auth.uid());


-- KEBIJAKAN UNTUK TABEL: attendance
-- Admin memiliki akses penuh.
CREATE POLICY "Admins have full access to attendance" 
ON public.attendance FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Orang Tua dapat membaca riwayat absensi anak-anak mereka.
CREATE POLICY "Parents can view their own children attendance" 
ON public.attendance FOR SELECT 
TO authenticated 
USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE parent_id = auth.uid()
  )
);


-- KEBIJAKAN UNTUK TABEL: reports
-- Admin memiliki akses penuh.
CREATE POLICY "Admins have full access to reports" 
ON public.reports FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Orang Tua dapat membaca rapor belajar digital anak-anak mereka.
CREATE POLICY "Parents can view their own children reports" 
ON public.reports FOR SELECT 
TO authenticated 
USING (
  student_id IN (
    SELECT id FROM public.students 
    WHERE parent_id = auth.uid()
  )
);

-- =====================================================================
-- 4. INDEKS UNTUK OPTIMALISASI KINERJA (INDEXES)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_reports_student_id ON public.reports(student_id);

-- =====================================================================
-- 5. TABEL TAMBAHAN UNTUK CMS LANDING PAGE DINAMIS
-- =====================================================================

-- TABEL: landing_settings (Konfigurasi Landing Page)
CREATE TABLE IF NOT EXISTS public.landing_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABEL: testimonials (Testimoni Landing Page)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABEL: gallery (Galeri Landing Page)
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan RLS pada tabel-tabel baru
ALTER TABLE public.landing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS untuk public.landing_settings
CREATE POLICY "Allow public read access to landing_settings" 
ON public.landing_settings FOR SELECT 
USING (true);

CREATE POLICY "Allow admin full access to landing_settings" 
ON public.landing_settings FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Kebijakan RLS untuk public.testimonials
CREATE POLICY "Allow public read access to testimonials" 
ON public.testimonials FOR SELECT 
USING (true);

CREATE POLICY "Allow admin full access to testimonials" 
ON public.testimonials FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Kebijakan RLS untuk public.gallery
CREATE POLICY "Allow public read access to gallery" 
ON public.gallery FOR SELECT 
USING (true);

CREATE POLICY "Allow admin full access to gallery" 
ON public.gallery FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Buat indeks untuk optimalisasi pencarian/kinerja
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);

-- =====================================================================
-- 6. TABEL-TABEL NEXT LEVEL (KEUANGAN, TES PENEMPATAN, & JADWAL)
-- =====================================================================

-- TABEL: tuition_payments (Pembayaran SPP)
CREATE TABLE IF NOT EXISTS public.tuition_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: "YYYY-MM" (contoh: "2026-06")
  amount INTEGER NOT NULL DEFAULT 150000, -- Nominal rupiah
  status TEXT NOT NULL DEFAULT 'belum_bayar' CHECK (status IN ('lunas', 'belum_bayar', 'menunggu_konfirmasi')),
  payment_method TEXT CHECK (payment_method IN ('Transfer Bank', 'Tunai', 'Lainnya')),
  receipt_url TEXT, -- Tautan gambar bukti transfer di Supabase Storage
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_student_payment_per_month UNIQUE (student_id, month)
);

-- TABEL: placement_test_submissions (Hasil Tes Penempatan Publik)
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

-- TABEL: academic_schedules (Kalender Jadwal Kelas & Kegiatan)
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

-- Aktifkan RLS
ALTER TABLE public.tuition_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_schedules ENABLE ROW LEVEL SECURITY;

-- KEBIJAKAN RLS: tuition_payments
CREATE POLICY "Admins have full access to tuition_payments"
ON public.tuition_payments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Parents can view their children payments"
ON public.tuition_payments FOR SELECT TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can insert/update payment receipts for their children"
ON public.tuition_payments FOR ALL TO authenticated
USING (student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()));

-- KEBIJAKAN RLS: placement_test_submissions
CREATE POLICY "Allow anyone to insert placement test submissions"
ON public.placement_test_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to placement_test_submissions"
ON public.placement_test_submissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- KEBIJAKAN RLS: academic_schedules
CREATE POLICY "Admins have full access to academic_schedules"
ON public.academic_schedules FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Allow authenticated users to view academic schedules"
ON public.academic_schedules FOR SELECT TO authenticated USING (true);

-- Indeks Tambahan
CREATE INDEX IF NOT EXISTS idx_tuition_payments_student_id ON public.tuition_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_schedules_start_time ON public.academic_schedules(start_time);

-- =====================================================================
-- 7. KONFIGURASI STORAGE BUCKETS DAN KEBIJAKAN (POLICIES)
-- =====================================================================

-- Buat bucket penyimpanan jika belum ada (gallery-uploads dan spp-receipts)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('gallery-uploads', 'gallery-uploads', true),
  ('spp-receipts', 'spp-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan RLS untuk Storage - gallery-uploads (Hanya Admin yang bisa modifikasi, Publik bisa baca)
DROP POLICY IF EXISTS "Public Access - gallery-uploads" ON storage.objects;
CREATE POLICY "Public Access - gallery-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-uploads');

DROP POLICY IF EXISTS "Admin Upload - gallery-uploads" ON storage.objects;
CREATE POLICY "Admin Upload - gallery-uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery-uploads' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Update - gallery-uploads" ON storage.objects;
CREATE POLICY "Admin Update - gallery-uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery-uploads' AND public.is_admin())
WITH CHECK (bucket_id = 'gallery-uploads' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete - gallery-uploads" ON storage.objects;
CREATE POLICY "Admin Delete - gallery-uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery-uploads' AND public.is_admin());


-- Kebijakan RLS untuk Storage - spp-receipts (Pengguna Terautentikasi bisa upload, Publik bisa baca)
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
-- Untuk menetapkan peran pengguna pertama sebagai 'admin', Anda dapat
-- mendaftar melalui aplikasi secara normal (default: parent), lalu
-- jalankan perintah SQL ini dengan mengganti UUID-nya:
--
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'UUID_AKUN_ANDA';
-- =====================================================================


