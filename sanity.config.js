import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schema } from "./src/sanity/schemaTypes";
import { customStructure } from "./src/sanity/structure";
import { brandingPlugin } from "./src/sanity/branding";

export default defineConfig({
  name: "default",
  title: "Ibra Global English CMS",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fyq0xcf8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  basePath: "/studio", // Rute URL untuk mengakses editor studio

  // Logo: menampilkan logo Ibra Global English
  logo: {
    icon: '/assets/logo.png',
    title: 'Ibra Global English CMS',
  },

  // Tema kustom: mengubah warna utama dan branding studio agar sesuai dengan Ibra Global English
  theme: {
    colors: {
      primary: '#037782',
      primaryHover: '#025a68',
      primaryLight: 'rgba(3, 119, 130, 0.1)',
    },
    // Font yang digunakan di seluruh studio
    font: {
      family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
  },

  plugins: [
    structureTool({
      structure: customStructure,
    }),
    brandingPlugin(),
  ],

  schema: schema,

  // Default view saat membuka dokumen
  defaultDocumentNode: (S) => {
    return S.document().views([
      S.view.form(),
    ]);
  },
});

