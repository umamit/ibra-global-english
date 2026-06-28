import { createClient } from "next-sanity";

// Invalidate cache to force Vercel to rebuild this module with the correct environment variables
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-03-11", // Gunakan tanggal API saat ini (YYYY-MM-DD)
  useCdn: process.env.NODE_ENV === "production", // true di prod untuk hemat kuota API & cache cepat
});

