import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

export function getPrisma() {
  return prisma;
}

async function main() {
  console.log("🔧 Setting up pgvector extension...");
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector;");
  console.log("✅ pgvector extension ready");

  console.log("🔧 Adding embedding column to rag_documents...");
  await prisma.$executeRawUnsafe(
    "ALTER TABLE rag_documents ADD COLUMN IF NOT EXISTS embedding vector(384);"
  );
  console.log("✅ embedding column ready");

  console.log("🔧 Creating IVFFlat index...");
  await prisma.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS idx_rag_documents_embedding ON rag_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);"
  );
  console.log("✅ index ready");

  console.log("🔧 Creating search_rag_documents function...");
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION search_rag_documents(
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
    LANGUAGE plpgsql AS $$
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
  console.log("✅ search function ready");

  // Verify
  const result = await prisma.$queryRawUnsafe(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rag_documents' AND column_name = 'embedding'"
  );
  console.log("✅ Verification - embedding column:", result.length > 0 ? "EXISTS" : "MISSING");
}

main()
  .then(() => console.log("🎉 pgvector setup complete!"))
  .catch((e) => {
    console.error("❌ Setup failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });