import { defineConfig, buildLegacyTheme } from "sanity";
import { structureTool } from "sanity/structure";
import { schema } from "./src/sanity/schemaTypes";
import { customStructure } from "./src/sanity/structure";
import { brandingPlugin } from "./src/sanity/branding";
import DashboardTool from "./src/sanity/components/DashboardTool";

export default defineConfig({
  name: "default",
  title: "Ibra Global English CMS",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fyq0xcf8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  basePath: "/studio", // Rute URL untuk mengakses editor studio

  // Tema kustom: mengubah warna utama dan branding studio agar sesuai dengan Ibra Global English
  theme: buildLegacyTheme({
    "--brand-primary": "#037782",
    "--font-family-sans": 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),

  tools: (prev) => [
    {
      name: "dashboard",
      title: "Dashboard",
      icon: () => "📊",
      component: DashboardTool,
    },
    ...prev
  ],

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

