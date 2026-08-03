import { prisma } from "../../lib/prisma";
import { generateEmbedding } from "./hfEmbeddingHelper";

export { generateEmbedding };

export function embeddingToPgVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function upsertRagDocument({ id, title, content, source = "manual", metadata = {} }: { id?: string; title: string; content: string; source?: string; metadata?: any }) {
  let embeddingVector: number[] = [];
  try { embeddingVector = await generateEmbedding(`${title}\n${content}`); } catch (_) {}
  
  if (id) {
    return prisma.ragDocument.update({
      where: { id },
      data: { title, content, source, metadata }
    });
  }
  return prisma.ragDocument.create({
    data: { title, content, source, metadata }
  });
}

export async function searchSimilarDocuments(query: string, topK = 3, threshold = 0.5) {
  try {
    let pgResults: any[] = [];
    let vectorSearchSuccess = false;
    try {
      const embedding = await generateEmbedding(query);
      const vectorStr = embeddingToPgVector(embedding);
      const results: any = await prisma.$queryRawUnsafe(`SELECT * FROM search_rag_documents($1::vector, $2, $3)`, vectorStr, threshold, topK);
      if (results && Array.isArray(results)) {
        pgResults = results.map(r => ({ id: r.id, title: r.title, content: r.content, source: r.source, metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : (r.metadata || {}), similarity: r.similarity }));
        vectorSearchSuccess = pgResults.length > 0;
      }
    } catch (_) {}

    if (!vectorSearchSuccess) {
      const searchPattern = `%${query.trim()}%`;
      const keywords = query.trim().split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9]/g, "")).filter(w => w.length > 1);
      let textResults: any[] = [];
      try {
        if (keywords.length > 0) {
          const conditions = keywords.map((_, idx) => `(title ILIKE $${idx * 2 + 1} OR content ILIKE $${idx * 2 + 2})`).join(" OR ");
          const params: any[] = keywords.flatMap(w => [`%${w}%`, `%${w}%`]);
          const sql = `SELECT id, title, content, source, metadata, ((CASE WHEN title ILIKE $${params.length + 1} THEN 1.0 ELSE 0.0 END) + (CASE WHEN content ILIKE $${params.length + 1} THEN 0.5 ELSE 0.0 END)) as similarity FROM rag_documents WHERE ${conditions} ORDER BY similarity DESC LIMIT $${params.length + 2}`;
          textResults = await prisma.$queryRawUnsafe(sql, ...params, searchPattern, topK);
        } else {
          textResults = await prisma.$queryRawUnsafe(`SELECT id, title, content, source, metadata, 0.5 as similarity FROM rag_documents ORDER BY updated_at DESC LIMIT $1`, topK);
        }
        if (textResults && Array.isArray(textResults)) {
          pgResults = textResults.map(r => ({ id: r.id, title: r.title, content: r.content, source: r.source, metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : (r.metadata || {}), similarity: r.similarity }));
        }
      } catch (_) {}
    }

    return pgResults.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  } catch (error: any) { return []; }
}

export async function getRagContext(query: string, topK = 3) {
  const docs = await searchSimilarDocuments(query, topK, 0.5);
  if (!docs || docs.length === 0) return "";
  const contextParts = docs.map((doc) => `### ${doc.title}\n${doc.content}`);
  return `\n\n[KONTEKS BASIS PENGETAHUAN RAG]\n${contextParts.join("\n\n")}\n[AKHIR KONTEKS RAG]\n\nGunakan konteks di atas sebagai referensi tambahan.`;
}

export async function listRagDocuments() {
  return prisma.ragDocument.findMany({ select: { id: true, title: true, content: true, source: true, metadata: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "desc" } });
}

export async function deleteRagDocument(id: string) {
  await prisma.ragDocument.delete({ where: { id } });
}