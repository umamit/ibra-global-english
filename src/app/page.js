export const dynamic = 'force-dynamic';

import HomeClient from "./HomeClient";
import { getLandingSettings } from "@/utils/getLandingSettings";

export async function generateMetadata() {
  const settings = await getLandingSettings();
  
  const heroTitle = settings.hero_title || "Ibra Global English Bobong";
  const heroSubtitle = settings.hero_subtitle || "Kursus Bahasa Inggris Terbaik";
  const title = `${heroTitle} - ${heroSubtitle}`;
  
  const description = settings.hero_desc || 
    "Ibra Global English Bobong menawarkan kursus bahasa Inggris offline & bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu. Metode interaktif, menyenangkan, dan tutor berpengalaman. Tingkatkan kemampuan berbicara (speaking) Anda sekarang!";
  
  const heroImage = settings.hero_image || "/assets/logo.png";

  return {
    title,
    description,
    keywords: [
      "kursus bahasa inggris bobong",
      "ibra global english bobong",
      "kursus inggris taliabu",
      "les bahasa inggris bobong",
      "bimbel calistung bobong",
      "belajar bahasa inggris taliabu"
    ],
    alternates: {
      canonical: "/",
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
