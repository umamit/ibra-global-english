import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { upsertRagDocument, searchSimilarDocuments } from "../src/utils/rag.ts";

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const documents = [
  {
    title: "Tips belajar bahasa Inggris untuk pemula",
    content: "Langkah pertama belajar bahasa Inggris adalah menguasai alphabet dan phonik. Setelah itu, pelajari kosakata dasar 1000 kata yang paling sering digunakan. Latih speaking setiap hari minimal 15 menit dengan merekam diri sendiri. Dengarkan podcast atau lagu Inggris untuk melatih listening. Jangan takut membuat kesalahan, karena kesalahan adalah bagian dari proses belajar.",
    source: "faq",
    metadata: { category: "tips", level: "beginner" },
  },
  {
    title: "Program Fun Calistung di Ibra Global English",
    content: "Program Fun Calistung dirancang untuk anak usia 5-7 tahun. Materi meliputi: pengenalan huruf A-Z dan bunyi fonik (phonics), membaca suku kata terbuka, membaca kata dasar dan kalimat pendek, menulis huruf abjad dan angka dasar 1-20, serta berhitung dasar (penjumlahan dan pengurangan 1-10). Metode pengajaran menggunakan activities yang menyenangkan dan ramah anak.",
    source: "course_material",
    metadata: { category: "program", age_group: "5-7" },
  },
  {
    title: "Cara pendaftaran siswa baru",
    content: "Pendaftaran siswa baru dapat dilakukan dengan 3 cara: 1) Hubungi WhatsApp +62 813-5700-1357, 2) Isi formulir pendaftaran di website ibraglobalenglish.uk, 3) Datang langsung ke lokasi di Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah, Bobong, Pulau Taliabu, Maluku Utara. Proses pendaftaran memerlukan data diri siswa dan orang tua/wali.",
    source: "website",
    metadata: { category: "registrasi", topic: "pendaftaran" },
  },
  {
    title: "Program Teens - materi speaking dan grammar",
    content: "Program Teens untuk usia 13-17 tahun fokus pada: self presentation dan presentasi hobi, describing people/places/objects, simple past tense dan personal recounts, asking & giving opinions, future plans dan expressing intentions, serta modal auxiliaries dan conditional sentences. Metode komunikatif berbasis proyek untuk membantu persiapan ujian sekolah dan masa depan karir.",
    source: "course_material",
    metadata: { category: "program", age_group: "13-17" },
  },
  {
    title: "Kontak dan lokasi Ibra Global English",
    content: "Ibra Global English beralamat di Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah, Bobong, Pulau Taliabu, Maluku Utara. Email: admin@ibraglobalenglish.uk. WhatsApp: +62 813-5700-1357. Website: https://www.ibraglobalenglish.uk.",
    source: "website",
    metadata: { category: "kontak" },
  },
];

async function main() {
  console.log("🌱 Seeding RAG documents...\n");

  for (const doc of documents) {
    await upsertRagDocument(doc);
  }

  console.log("\n✅ All documents seeded successfully!");

  // Test search
  console.log("\n🔍 Testing RAG search...");
  const query = "Bagaimana cara daftar kursus?";
  console.log(`Query: "${query}"`);
  const results = await searchSimilarDocuments(query, 3, 0.5);
  console.log(`Found ${results.length} relevant documents:`);
  for (const r of results) {
    console.log(`  - ${r.title} (similarity: ${(r.similarity * 100).toFixed(1)}%)`);
  }
}

main()
  .then(() => console.log("\n🎉 RAG seeding complete!"))
  .catch((e) => {
    console.error("❌ Failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });