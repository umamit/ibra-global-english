-- =====================================================================
-- IBRA GLOBAL ENGLISH BOBONG - RAG (Retrieval-Augmented Generation)
-- =====================================================================
-- Jalankan skrip SQL ini di Supabase SQL Editor.
-- Membutuhkan ekstensi pgvector.

-- 1. Aktifkan ekstensi pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabel dokumen untuk RAG
CREATE TABLE IF NOT EXISTS public.rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'faq', 'course_material', 'website', 'other')),
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(384),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Indeks untuk similarity search (IVFFlat - good balance of speed/recall)
CREATE INDEX IF NOT EXISTS idx_rag_documents_embedding 
  ON public.rag_documents 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Fungsi similarity search (cosine distance)
CREATE OR REPLACE FUNCTION public.search_rag_documents(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rag_documents.id,
    rag_documents.title,
    rag_documents.content,
    rag_documents.source,
    rag_documents.metadata,
    1 - (rag_documents.embedding <=> query_embedding) AS similarity
  FROM rag_documents
  WHERE 1 - (rag_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY rag_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. RLS
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access rag_documents"
ON public.rag_documents FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Authenticated users can read (for chatbot context)
CREATE POLICY "Authenticated select rag_documents"
ON public.rag_documents FOR SELECT TO authenticated
USING (true);

-- Public can read (for public chatbot)
CREATE POLICY "Public select rag_documents"
ON public.rag_documents FOR SELECT
USING (true);

-- 6. Trigger untuk update updated_at
CREATE OR REPLACE FUNCTION public.update_rag_documents_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rag_documents_updated_at ON public.rag_documents;
CREATE TRIGGER trg_rag_documents_updated_at
  BEFORE UPDATE ON public.rag_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rag_documents_updated_at();

-- =====================================================================
-- SEED DATA: Dokumen default tentang Ibra Global English
-- =====================================================================
-- Catatan: embedding akan diisi oleh aplikasi. Seed hanya untuk struktur.
-- Jalankan seeding embedding via aplikasi (API atau script).
</｜｜DSML｜｜parameter>
</write_to_file>