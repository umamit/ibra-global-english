-- =====================================================================
-- SKRIP MIGRASI: PEMBUATAN TABEL AUDIT LOG PENGGUNAAN AI
-- =====================================================================
-- Jalankan skrip ini di Supabase SQL Editor untuk menginisialisasi
-- tabel perekaman audit transaksi AI (Groq API).

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  role TEXT,
  mode TEXT NOT NULL, -- 'auto-draft', 'announcement-polish', 'insights', 'chat', 'public-chat'
  tokens_used INTEGER,
  status TEXT NOT NULL, -- 'success', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS: Hanya Admin yang bisa membaca/melihat data log penggunaan AI
DROP POLICY IF EXISTS "Admins have full access to ai_usage_logs" ON public.ai_usage_logs;
CREATE POLICY "Admins have full access to ai_usage_logs"
ON public.ai_usage_logs FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Buat indeks untuk mempercepat kueri pelacakan aktivitas historis
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_mode ON public.ai_usage_logs(mode);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
