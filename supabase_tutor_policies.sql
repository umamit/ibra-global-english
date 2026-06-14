-- =====================================================================
-- IBRA GLOBAL ENGLISH - TUTOR RLS POLICIES & CONSTRAINTS SETUP
-- =====================================================================
-- Jalankan skrip SQL ini di Supabase SQL Editor (Dashboard Supabase -> SQL Editor)
-- Untuk mengizinkan akun pengajar (Tutor) membaca siswa, absensi, dan rapor modul.

-- 1. Perbarui check constraint pada tabel profiles agar mengizinkan peran 'tutor' dan 'student'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'parent', 'tutor', 'student'));

-- 2. Buat fungsi pembantu is_tutor() untuk memeriksa peran tutor secara aman
CREATE OR REPLACE FUNCTION public.is_tutor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'tutor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Kebijakan RLS untuk tabel: students
-- Mengizinkan Tutor untuk melihat (SELECT) data semua siswa bimbingan
DROP POLICY IF EXISTS "Tutors can view all students" ON public.students;
CREATE POLICY "Tutors can view all students" 
ON public.students FOR SELECT 
TO authenticated 
USING (public.is_tutor());

-- 4. Kebijakan RLS untuk tabel: attendance
-- Mengizinkan Tutor untuk melakukan semua operasi (SELECT, INSERT, UPDATE, DELETE) pada absensi harian
DROP POLICY IF EXISTS "Tutors have full access to attendance" ON public.attendance;
CREATE POLICY "Tutors have full access to attendance" 
ON public.attendance FOR ALL 
TO authenticated 
USING (public.is_tutor())
WITH CHECK (public.is_tutor());

-- 5. Kebijakan RLS untuk tabel: reports
-- Mengizinkan Tutor untuk melakukan semua operasi (SELECT, INSERT, UPDATE, DELETE) pada rapor modul
DROP POLICY IF EXISTS "Tutors have full access to reports" ON public.reports;
CREATE POLICY "Tutors have full access to reports" 
ON public.reports FOR ALL 
TO authenticated 
USING (public.is_tutor())
WITH CHECK (public.is_tutor());
