import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL tidak ditemukan di .env.production");
  process.exit(1);
}

async function main() {
  console.log("🔌 Connecting to Vercel/Prisma Postgres database...");
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("✅ Connected successfully.");

  // 1. Enable pgvector extension
  console.log("➡️ Enabling vector extension...");
  await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
  console.log("✅ Vector extension enabled.");

  // 2. Create search_rag_documents function
  console.log("➡️ Creating search_rag_documents function...");
  await client.query(`
    CREATE OR REPLACE FUNCTION public.search_rag_documents(
      query_embedding vector(384),
      match_threshold float DEFAULT 0.7,
      match_count int DEFAULT 5
    )
    RETURNS TABLE (
      id TEXT,
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
  `);
  console.log("✅ Function search_rag_documents created successfully.");

  await client.end();
  console.log("🎉 Database setup complete!");
}

main().catch(console.error);
