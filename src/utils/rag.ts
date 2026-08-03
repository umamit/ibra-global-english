import { createClient } from "@/utils/supabase/server";
import { generateEmbedding } from "./hfEmbeddingHelper";

export { generateEmbedding };

export function embeddingToPgVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function upsertRagDocument({ id, title, content, source = "manual", metadata = {} }: { id?: string; title: string; content: string; source?: string; metadata?: any }) {
  const supabase = await createClient();
  let embeddingVector: number[] = [];
  try { embeddingVector = await generateEmbedding(`${title}\n${content}`); } catch (_) {}

  const payload: any = { title, content, source, metadata, updated_at: new Date().toISOString() };
  if (embeddingVector.length > 0) payload.embedding = embeddingToPgVector(embeddingVector);

  if (id) {
    const { data, error } = await supabase.from("rag_documents").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase.from("rag_documents").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function searchSimilarDocuments(query: string, topK = 3, threshold = 0.5) {
  try {
    const supabase = await createClient();
    let pgResults: any[] = [];
    let vectorSearchSuccess = false;

    try {
      const embedding = await generateEmbedding(query);
      const { data, error } = await supabase.rpc("search_rag_documents", {
        query_embedding: embeddingToPgVector(embedding),
        match_threshold: threshold,
        match_count: topK
      });

      if (!error && data && Array.isArray(data)) {
        pgResults = data.map((r: any) => ({ id: r.id, title: r.title, content: r.content, source: r.source, metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : (r.metadata || {}), similarity: r.similarity }));
        vectorSearchSuccess = pgResults.length > 0;
      }
    } catch (_) {}

    if (!vectorSearchSuccess) {
      const { data } = await supabase.from("rag_documents").select("id, title, content, source, metadata").ilike("title", `%${query}%`).limit(topK);
      if (data) pgResults = data.map((r: any) => ({ ...r, similarity: 0.8 }));
    }

    return pgResults;
  } catch { return []; }
}

export async function getRagContext(query: string, topK = 3) {
  const docs = await searchSimilarDocuments(query, topK);
  if (!docs || docs.length === 0) return "";
  return docs.map((d: any) => `[Dokumen: ${d.title}]\n${d.content}`).join("\n\n");
}