import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schema } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Ibra Global English CMS",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fyq0xcf8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  basePath: "/studio", // Rute URL untuk mengakses editor studio

  plugins: [structureTool()],

  schema: schema,
});
