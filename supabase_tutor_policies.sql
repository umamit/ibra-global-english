-- =====================================================================
-- IBRA GLOBAL ENGLISH - TUTOR RLS POLICIES & CONSTRAINTS SETUP
-- =====================================================================
--
-- NOTE: Fungsi is_tutor() dan kebijakan RLS untuk tutor sudah
-- TERINTEGRASI di dalam supabase_schema.sql (bagian 2b dan 3).
--
-- Skrip ini dipertahankan sebagai referensi / migration terpisah
-- jika Anda hanya perlu menambahkan kebijakan tutor tanpa
-- menjalankan ulang seluruh schema.sql.
--
-- Jalankan skrip ini jika:
-- 1. Anda SUDAH menjalankan supabase_schema.sql versi LAMA
--    (yang belum memiliki fungsi is_tutor / is_admin_or_tutor)
-- 2. Anda hanya ingin menambahkan akses tutor saja
-- =====================================================================

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
DROP POLICY IF EXISTS "Tutors can view all students" ON public.students;
CREATE POLICY "Tutors can view all students" 
ON public.students FOR SELECT 
TO authenticated 
USING (public.is_tutor());

-- 4. Kebijakan RLS untuk tabel: attendance
DROP POLICY IF EXISTS "Tutors have full access to attendance" ON public.attendance;
CREATE POLICY "Tutors have full access to attendance" 
ON public.attendance FOR ALL 
TO authenticated 
USING (public.is_tutor())
WITH CHECK (public.is_tutor());

-- 5. Kebijakan RLS untuk tabel: reports
DROP POLICY IF EXISTS "Tutors have full access to reports" ON public.reports;
CREATE POLICY "Tutors have full access to reports" 
ON public.reports FOR ALL 
TO authenticated 
USING (public.is_tutor())
WITH CHECK (public.is_tutor());