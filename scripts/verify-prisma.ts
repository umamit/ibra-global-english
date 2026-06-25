import { prisma } from "../lib/prisma.js";

async function main() {
  const count = await prisma.user.count();
  console.log(`✅ Connected. Found ${count} user(s) in the database.`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });