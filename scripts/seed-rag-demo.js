import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

function createMockEmbedding(text) {
  const dim = 384;
  const embedding = new Array(dim).fill(0);
  const seed = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = 0; i < dim; i++) {
    embedding[i] = Math.sin(seed * (i + 1)) * Math.cos(i * 0.1);
  }
  return embedding;
}

async function main() {
  console.log("🌱 Seeding RAG documents with mock embeddings (demo mode)...\n");

  const docs = await prisma.ragDocument.findMany();
  console.log(`Found ${docs.length} documents`);

  for (const doc of docs) {
    const embedding = createMockEmbedding(`${doc.title}. ${doc.content}`);
    const vectorStr = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(
      `UPDATE rag_documents SET embedding = $1::vector WHERE id = $2`,
      vectorStr, doc.id
    );
    console.log(`✅ ${doc.title}`);
  }

  // Test vector search
  console.log("\n🔍 Testing vector search...");
  const query = "Bagaimana cara daftar kursus?";
  console.log(`Query: ${query}`);

  const queryEmbedding = createMockEmbedding(query);
  const queryVectorStr = `[${queryEmbedding.join(",")}]`;

  const results = await prisma.$queryRawUnsafe(
    `SELECT * FROM search_rag_documents($1::vector, 0.1, 3)`,
    queryVectorStr
  );

  console.log(`Found ${results.length} results:`);
  for (const r of results) {
    console.log(`  - ${r.title} (${(r.similarity * 100).toFixed(1)}%)`);
  }

  if (results.length === 0) {
    console.log("\nNo results with mock embeddings (expected in demo mode).");
    console.log("In production, real embeddings will enable similarity search.");
  }
}

main()
  .then(() => console.log("\n🎉 Demo seeding complete!"))
  .catch((e) => {
    console.error("❌ Failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });