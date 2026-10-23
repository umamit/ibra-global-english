export const revalidate = 300;

import { Metadata } from 'next';
import HomeClient from "./HomeClient";
import { getLandingSettings } from "@/utils/getLandingSettings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLandingSettings();

  const rawTitle = settings.hero_title || "PT. IBRA GLOBAL ENGLISH (IGE) -- Kursus Bahasa Inggris dan CALISTUNG di Bobong";
  const heroTitle = rawTitle.includes("IGE") ? rawTitle : `${rawTitle} (IGE)`;
  const heroSubtitle = settings.hero_subtitle || "Kursus Bahasa Inggris Terbaik di Bobong";
  const baseTitle = `${heroTitle} - ${heroSubtitle}`;
  const title = baseTitle.toLowerCase().includes("bobong") ? baseTitle : `${baseTitle} di Bobong`;

  const rawDesc = settings.hero_desc ||
    "PT. IBRA GLOBAL ENGLISH (IGE) -- Kursus Bahasa Inggris, Calistung, dan Matematika Dasar terbaik di Bobong, Taliabu Barat, Kabupaten Pulau Taliabu. Metode interaktif, menyenangkan, dan tutor berpengalaman di Bobong!";
  const description = rawDesc.includes("IGE") ? rawDesc : `PT. IBRA GLOBAL ENGLISH (IGE) Bobong — ${rawDesc}`;

  const heroImage = settings.hero_image || "/assets/logo.png";

  return {
    title,
    description,
    keywords: [
      "bobong",
      "kota bobong",
      "bobong taliabu",
      "bobong pulau taliabu",
      "ige",
      "ige bobong",
      "ige taliabu",
      "kursus ige",
      "lkp ige bobong",
      "pt ibra global english",
      "ibra global english",
      "kursus di bobong",
      "kursus bahasa inggris bobong",
      "ibra global english bobong",
      "kursus inggris taliabu",
      "les bahasa inggris bobong",
      "bimbel calistung bobong",
      "matematika dasar bobong",
      "belajar bahasa inggris taliabu"
    ],
    alternates: {
      canonical: "https://www.ibraglobalenglish.uk",
    },
    openGraph: {
      title,
      description,
      url: "https://www.ibraglobalenglish.uk/",
      type: "website",
      images: [
        {
          url: heroImage,
          width: 512,
          height: 512,
          alt: "Ibra Global English Logo",
        }
      ],
    },
  };
}

export default async function HomePage() {
  const initialSettings = await getLandingSettings();
  return <HomeClient initialSettings={initialSettings} />;
}
