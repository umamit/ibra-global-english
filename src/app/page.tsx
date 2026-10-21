export const revalidate = 300;

import { Metadata } from 'next';
import HomeClient from "./HomeClient";
import { getLandingSettings } from "@/utils/getLandingSettings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLandingSettings();

  const rawTitle = settings.hero_title || "Ibra Global English (IGE) Bobong";
  const heroTitle = rawTitle.includes("IGE") ? rawTitle : `${rawTitle} (IGE)`;
  const heroSubtitle = settings.hero_subtitle || "Kursus Bahasa Inggris Terbaik";
  const title = `${heroTitle} - ${heroSubtitle}`;

  const rawDesc = settings.hero_desc ||
    "Ibra Global English (IGE) Bobong menawarkan kursus bahasa Inggris offline & bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu. Metode interaktif, menyenangkan, dan tutor berpengalaman. Tingkatkan kemampuan berbicara (speaking) Anda di IGE sekarang!";
  const description = rawDesc.includes("IGE") ? rawDesc : `Ibra Global English (IGE) — ${rawDesc}`;

  const heroImage = settings.hero_image || "/assets/logo.png";

  return {
    title,
    description,
    keywords: [
      "ige",
      "ige bobong",
      "ige taliabu",
      "kursus ige",
      "lkp ige bobong",
      "ibra global english",
      "kursus bahasa inggris bobong",
      "ibra global english bobong",
      "kursus inggris taliabu",
      "les bahasa inggris bobong",
      "bimbel calistung bobong",
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
