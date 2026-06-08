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

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    full_name_val,
    default_role
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
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- KEBASAN / KEBIJAKAN UNTUK TABEL: profiles
-- Admin bisa melakukan apa saja.
CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);

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


-- KEBASAN / KEBIJAKAN UNTUK TABEL: students
-- Admin memiliki akses penuh.
CREATE POLICY "Admins have full access to students" 
ON public.students FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);

-- Orang Tua dapat membaca data siswa yang merupakan anak mereka (parent_id cocok).
CREATE POLICY "Parents can view their own students" 
ON public.students FOR SELECT 
TO authenticated 
USING (parent_id = auth.uid());


-- KEBASAN / KEBIJAKAN UNTUK TABEL: attendance
-- Admin memiliki akses penuh.
CREATE POLICY "Admins have full access to attendance" 
ON public.attendance FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);

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


-- KEBASAN / KEBIJAKAN UNTUK TABEL: reports
-- Admin memiliki akses penuh.
CREATE POLICY "Admins have full access to reports" 
ON public.reports FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE public.profiles.id = auth.uid() AND public.profiles.role = 'admin'
  )
);

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
-- Catatan Penting untuk Administrator:
-- Untuk menetapkan peran pengguna pertama sebagai 'admin', Anda dapat
-- mendaftar melalui aplikasi secara normal (default: parent), lalu
-- jalankan perintah SQL ini dengan mengganti UUID-nya:
--
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'UUID_AKUN_ANDA';
-- =====================================================================
