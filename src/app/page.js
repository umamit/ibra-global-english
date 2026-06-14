export const dynamic = 'force-dynamic';

import HomeClient from "./HomeClient";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Ibra Global English Bobong - Kursus Bahasa Inggris Terbaik",
  description: "Ibra Global English Bobong menawarkan kursus bahasa Inggris offline & bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu. Metode interaktif, menyenangkan, dan tutor berpengalaman. Tingkatkan kemampuan berbicara (speaking) Anda sekarang!",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ibra Global English Bobong - Kursus Bahasa Inggris Terbaik",
    description: "Kursus bahasa Inggris offline & bimbingan belajar Calistung terbaik di Bobong, Pulau Taliabu. Metode interaktif, menyenangkan, dan tutor berpengalaman.",
    url: "https://www.ibraglobalenglish.uk/",
    type: "website",
    images: [
      {
        url: "/assets/logo.png",
        width: 512,
        height: 512,
        alt: "Ibra Global English Logo",
      }
    ],
  },
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: settingsData } = await supabase
    .from("landing_settings")
    .select("key, value");

  const initialSettings = {};
  if (settingsData) {
    settingsData.forEach((item) => {
      initialSettings[item.key] = item.value;
    });
  }

  return <HomeClient initialSettings={initialSettings} />;
}
