import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
    },
  });
  console.log("Created user:", user.id, user.email);

  // Create a couple of posts
  const post1 = await prisma.post.create({
    data: {
      title: "Hello Prisma Postgres",
      content: "This is my first post using Prisma Postgres!",
      authorId: user.id,
    },
  });
  console.log("Created post:", post1.id, post1.title);

  const post2 = await prisma.post.create({
    data: {
      title: "Second Post",
      content: "Prisma works great with Next.js and Postgres.",
      authorId: user.id,
    },
  });
  console.log("Created post:", post2.id, post2.title);

  // Read back
  const users = await prisma.user.findMany({ include: { posts: true } });
  console.log(`\n✅ Seeded ${users.length} user(s) with ${users[0].posts.length} post(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });