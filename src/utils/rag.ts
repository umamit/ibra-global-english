/**
 * RAG (Retrieval-Augmented Generation) Utility Module
 * 
 * Uses HuggingFace's free inference API (all-MiniLM-L6-v2, 384-dim) for embeddings.
 * No API key required - completely free.
 * 
 * Uses Prisma Postgres with pgvector for similarity search.
 */

import { prisma } from "../../lib/prisma";

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const HF_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;

/**
 * Generate embedding for a text using HuggingFace's free inference API.
 * Returns a 384-dimensional float array.
 * 
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - 384-dim embedding vector
 */
export async function generateEmbedding(text: string) {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty for embedding");
  }

  // Truncate very long text to avoid API limits (max ~512 tokens ≈ ~2000 chars)
  const truncatedText = text.slice(0, 2000);

  const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

  const tryFetch = async (useToken: boolean, usePipelineUrl: boolean): Promise<Response> => {
    const url = usePipelineUrl
      ? `https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2`
      : `https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (useToken && hfToken) {
      headers["Authorization"] = `Bearer ${hfToken}`;
    }

    return await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: truncatedText,
        options: { wait_for_model: true },
      }),
    });
  };

  let response: Response | undefined;
  const attempts = [
    { useToken: true, usePipelineUrl: false },  // 1. Standard URL + Token
    { useToken: false, usePipelineUrl: false }, // 2. Standard URL, no Token (fallback for invalid credentials)
    { useToken: true, usePipelineUrl: true },   // 3. Pipeline URL + Token
    { useToken: false, usePipelineUrl: true }   // 4. Pipeline URL, no Token
  ];

  let lastError: any = null;

  for (const opt of attempts) {
    // Jika tidak ada token terkonfigurasi, lewati opsi percobaan menggunakan token
    if (opt.useToken && !hfToken) continue;

    try {
      response = await tryFetch(opt.useToken, opt.usePipelineUrl);
      
      if (response.ok) {
        break; // Berhasil! Keluar dari loop pencarian
      }

      const errText = await response.text();
      console.warn(`HF attempt failed (URL: ${opt.usePipelineUrl ? 'pipeline' : 'models'}, Token: ${opt.useToken}): status ${response.status}, ${errText}`);
      
      // Jika model sedang dimuat, tunggu sebentar lalu coba lagi opsi yang sama sekali lagi
      if (response.status === 503) {
        console.log("Model loading, retrying in 3.5s...");
        await new Promise((r) => setTimeout(r, 3500));
        response = await tryFetch(opt.useToken, opt.usePipelineUrl);
        if (response.ok) break;
      }
      
      lastError = new Error(`HF Status ${response.status}: ${errText}`);
    } catch (err: any) {
      console.warn(`HF connection error (Token: ${opt.useToken}): ${err.message}`);
      lastError = err;
    }
  }

  if (!response || !response.ok) {
    throw new Error(`Embedding API failed completely: ${lastError?.message || 'unknown error'}`);
  }

  const data = await response.json();

  // HuggingFace returns array of arrays (token-level) or flat array
  // For all-MiniLM-L6-v2, we get a nested array - take the mean pooling
  let embedding;
  if (Array.isArray(data) && Array.isArray(data[0])) {
    // Mean pooling over token embeddings
    const tokens = data;
    const dim = tokens[0].length;
    embedding = new Array(dim).fill(0);
    for (const token of tokens) {
      for (let i = 0; i < dim; i++) {
        embedding[i] += token[i];
      }
    }
    for (let i = 0; i < dim; i++) {
      embedding[i] /= tokens.length;
    }
  } else if (Array.isArray(data)) {
    embedding = data;
  } else {
    throw new Error("Unexpected embedding API response format");
  }

  return embedding;
}

/**
 * Convert embedding array to PostgreSQL vector string format.
 * @param {number[]} embedding 
 * @returns {string}
 */
function embeddingToPgVector(embedding: number[]) {
  return `[${embedding.join(",")}]`;
}

/**
 * Add or update a document in the RAG knowledge base.
 * Generates embedding and stores it in the database.
 * 
 * @param {Object} params
 * @param {string} params.title - Document title
 * @param {string} params.content - Document content
 * @param {string} [params.source='manual'] - Source type
 * @param {Object} [params.metadata={}] - Additional metadata
 * @param {string} [params.id] - Optional ID for update
 * @returns {Promise<Object>} - The created/updated document
 */
export async function upsertRagDocument({ title, content, source = "manual", metadata = {}, id }: { title: string; content: string; source?: string; metadata?: any; id?: string }) {
  console.log(`🔄 Generating embedding for: "${title}"`);
  
  let vectorStr: string | null = null;
  try {
    const embedding = await generateEmbedding(`${title}. ${content}`);
    vectorStr = embeddingToPgVector(embedding);
  } catch (err: any) {
    console.warn("⚠️ Gagal membuat vector embedding (Hugging Face gagal/offline/diblokir):", err.message);
    console.warn("Dokumen akan disimpan tanpa vector embedding (hanya teks).");
  }

  if (id) {
    // Update existing document
    if (vectorStr) {
      await prisma.$executeRawUnsafe(
        `UPDATE rag_documents SET title = $1, content = $2, source = $3, metadata = $4, embedding = $5::vector WHERE id = $6`,
        title, content, source, JSON.stringify(metadata), vectorStr, id
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE rag_documents SET title = $1, content = $2, source = $3, metadata = $4 WHERE id = $5`,
        title, content, source, JSON.stringify(metadata), id
      );
    }
    const updated = await prisma.ragDocument.findUnique({ where: { id } });
    console.log(`✅ Updated document: ${id}`);
    return updated;
  } else {
    // Create new document
    const doc = await prisma.ragDocument.create({
      data: { title, content, source, metadata },
    });
    // Set embedding via raw SQL if available
    if (vectorStr) {
      await prisma.$executeRawUnsafe(
        `UPDATE rag_documents SET embedding = $1::vector WHERE id = $2`,
        vectorStr, doc.id
      );
    }
    console.log(`✅ Created document: ${doc.id}`);
    return doc;
  }
}

/**
 * Search for similar documents using vector similarity.
 * 
 * @param {string} query - The search query
 * @param {number} [topK=5] - Number of results
 * @param {number} [threshold=0.5] - Similarity threshold (0-1)
 * @returns {Promise<Array>} - Array of matching documents with similarity scores
 */
export async function searchSimilarDocuments(query: string, topK = 5, threshold = 0.5) {
  try {
    let pgResults: any[] = [];
    let vectorSearchSuccess = false;

    // 1. Coba pencarian Vector Similarity (jika Hugging Face dan pgvector berfungsi)
    try {
      const embedding = await generateEmbedding(query);
      const vectorStr = embeddingToPgVector(embedding);

      const results = await prisma.$queryRawUnsafe(
        `SELECT * FROM search_rag_documents($1::vector, $2, $3)`,
        vectorStr, threshold, topK
      );

      if (results && Array.isArray(results)) {
        pgResults = results.map(r => ({
          id: r.id,
          title: r.title,
          content: r.content,
          source: r.source,
          metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : (r.metadata || {}),
          similarity: r.similarity
        }));
        vectorSearchSuccess = pgResults.length > 0;
      }
    } catch (dbErr: any) {
      console.warn("Pencarian vector gagal atau dilewati (Hugging Face / pgvector offline):", dbErr.message);
    }

    // 2. Fallback: PostgreSQL Full-Text Search (FTS) menggunakan kata kunci ILIKE
    if (!vectorSearchSuccess) {
      console.log("Menjalankan Full-Text Search fallback pada tabel rag_documents...");
      
      const searchPattern = `%${query.trim()}%`;
      const keywords = query.trim().split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9]/g, "")).filter(w => w.length > 1);

      let textResults: any[] = [];
      try {
        if (keywords.length > 0) {
          // Cari dokumen dengan pembobotan pencocokan: judul cocok (1.0), konten cocok (0.5)
          const conditions = keywords.map((_, idx) => `(title ILIKE $${idx * 2 + 1} OR content ILIKE $${idx * 2 + 2})`).join(" OR ");
          const params: any[] = keywords.flatMap(w => [`%${w}%`, `%${w}%`]);

          const sql = `
            SELECT 
              id, 
              title, 
              content, 
              source, 
              metadata,
              (
                (CASE WHEN title ILIKE $${params.length + 1} THEN 1.0 ELSE 0.0 END) +
                (CASE WHEN content ILIKE $${params.length + 1} THEN 0.5 ELSE 0.0 END)
              ) as similarity
            FROM rag_documents
            WHERE ${conditions}
            ORDER BY similarity DESC
            LIMIT $${params.length + 2}
          `;

          textResults = await prisma.$queryRawUnsafe(
            sql,
            ...params,
            searchPattern,
            topK
          );
        } else {
          // Fallback tanpa kata kunci (ambil dokumen terbaru)
          textResults = await prisma.$queryRawUnsafe(
            `SELECT id, title, content, source, metadata, 0.5 as similarity FROM rag_documents ORDER BY updated_at DESC LIMIT $1`,
            topK
          );
        }

        if (textResults && Array.isArray(textResults)) {
          pgResults = textResults.map(r => ({
            id: r.id,
            title: r.title,
            content: r.content,
            source: r.source,
            metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : (r.metadata || {}),
            similarity: r.similarity
          }));
        }
      } catch (ftsErr: any) {
        console.error("Full-Text Search fallback failed:", ftsErr.message);
      }
    }

    // 3. Urutkan berdasarkan skor relevansi
    const combined = pgResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return combined;
  } catch (error: any) {
    console.error("RAG search error:", error.message);
    return [];
  }
}


/**
 * Get RAG context for a user query - formatted for LLM prompt injection.
 * 
 * @param {string} query - The user's question
 * @param {number} [topK=3] - Number of context documents
 * @returns {Promise<string>} - Formatted context string for LLM
 */
export async function getRagContext(query: string, topK = 3) {
  const docs = await searchSimilarDocuments(query, topK, 0.5);

  if (!docs || docs.length === 0) {
    return "";
  }

  const contextParts = docs.map((doc, i) => {
    return `### ${doc.title}\n${doc.content}`;
  });

  return `\n\n[KONTEKS BASIS PENGETAHUAN RAG]\n${contextParts.join("\n\n")}\n[AKHIR KONTEKS RAG]\n\nGunakan konteks di atas sebagai referensi tambahan untuk menjawab pertanyaan. Jika konteks tidak relevan, abaikan dan jawab berdasarkan pengetahuan umum Anda.`;
}

/**
 * List all RAG documents (without embeddings).
 * 
 * @returns {Promise<Array>}
 */
export async function listRagDocuments() {
  return prisma.ragDocument.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      source: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Delete a RAG document by ID.
 * 
 * @param {string} id 
 * @returns {Promise<void>}
 */
export async function deleteRagDocument(id: string) {
  await prisma.ragDocument.delete({ where: { id } });
}