import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

async function generateEmbedding(text) {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: text.slice(0, 2000), options: { wait_for_model: true } }),
  });

  if (!response.ok) {
    if (response.status === 503) {
      await new Promise((r) => setTimeout(r, 3000));
      return generateEmbedding(text);
    }
    throw new Error(`Embedding API failed: ${response.status}`);
  }

  const data = await response.json();
  let embedding;
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const dim = data[0].length;
    embedding = new Array(dim).fill(0);
    for (const token of data) {
      for (let i = 0; i < dim; i++) embedding[i] += token[i];
    }
    for (let i = 0; i < dim; i++) embedding[i] /= data.length;
  } else {
    embedding = data;
  }
  return embedding;
}

async function main() {
  console.log("🔍 Generating embeddings for existing RAG documents...\n");

  const docs = await prisma.ragDocument.findMany();
  console.log(`Found ${docs.length} documents`);

  for (const doc of docs) {
    console.log(`🔄 Processing: ${doc.title}`);
    const embedding = await generateEmbedding(`${doc.title}. ${doc.content}`);
    const vectorStr = `[${embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(
      `UPDATE rag_documents SET embedding = $1::vector WHERE id = $2`,
      vectorStr, doc.id
    );
    console.log(`  ✅ Embedding saved (${embedding.length} dims)`);
  }

  console.log("\n🎉 All embeddings generated!");
}

main()
  .then(() => console.log("Done!"))
  .catch((e) => {
    console.error("❌ Failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });