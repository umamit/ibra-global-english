/**
 * RAG (Retrieval-Augmented Generation) Utility Module
 * 
 * Uses HuggingFace's free inference API (all-MiniLM-L6-v2, 384-dim) for embeddings.
 * No API key required - completely free.
 * 
 * Uses Prisma Postgres with pgvector for similarity search.
 */

import { prisma } from "../../lib/prisma.js";

const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const HF_API_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;

/**
 * Generate embedding for a text using HuggingFace's free inference API.
 * Returns a 384-dimensional float array.
 * 
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - 384-dim embedding vector
 */
export async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty for embedding");
  }

  // Truncate very long text to avoid API limits (max ~512 tokens ≈ ~2000 chars)
  const truncatedText = text.slice(0, 2000);

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: truncatedText,
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("HuggingFace embedding API error:", response.status, errText);

    // If model is loading, retry once after a delay
    if (response.status === 503) {
      console.log("Model loading, retrying in 3s...");
      await new Promise((r) => setTimeout(r, 3000));
      return generateEmbedding(text);
    }

    throw new Error(`Embedding API failed: ${response.status}`);
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
function embeddingToPgVector(embedding) {
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
export async function upsertRagDocument({ title, content, source = "manual", metadata = {}, id }) {
  console.log(`🔄 Generating embedding for: "${title}"`);
  const embedding = await generateEmbedding(`${title}. ${content}`);
  const vectorStr = embeddingToPgVector(embedding);

  if (id) {
    // Update existing document
    await prisma.$executeRawUnsafe(
      `UPDATE rag_documents SET title = $1, content = $2, source = $3, metadata = $4, embedding = $5::vector WHERE id = $6`,
      title, content, source, JSON.stringify(metadata), vectorStr, id
    );
    const updated = await prisma.ragDocument.findUnique({ where: { id } });
    console.log(`✅ Updated document: ${id}`);
    return updated;
  } else {
    // Create new document
    const doc = await prisma.ragDocument.create({
      data: { title, content, source, metadata },
    });
    // Set embedding via raw SQL (Prisma doesn't support vector type natively)
    await prisma.$executeRawUnsafe(
      `UPDATE rag_documents SET embedding = $1::vector WHERE id = $2`,
      vectorStr, doc.id
    );
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
export async function searchSimilarDocuments(query, topK = 5, threshold = 0.5) {
  try {
    const embedding = await generateEmbedding(query);
    const vectorStr = embeddingToPgVector(embedding);

    const results = await prisma.$queryRawUnsafe(
      `SELECT * FROM search_rag_documents($1::vector, $2, $3)`,
      vectorStr, threshold, topK
    );

    return results;
  } catch (error) {
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
export async function getRagContext(query, topK = 3) {
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
export async function deleteRagDocument(id) {
  await prisma.ragDocument.delete({ where: { id } });
}