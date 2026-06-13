export const dynamic = 'force-dynamic';

import PlacementTestClient from "./PlacementTestClient";

export const metadata = {
  title: "Tes Penempatan Bahasa Inggris Online | Ibra Global English Bobong",
  description: "Uji kemampuan bahasa Inggris Anda secara gratis dalam 10 menit. Dapatkan skor instan, analisis tingkat kemampuan (Beginner/Intermediate/Advanced), dan sertifikat digital resmi.",
  alternates: {
    canonical: "/placement-test",
  },
  openGraph: {
    title: "Tes Penempatan Bahasa Inggris Online | Ibra Global English",
    description: "Tes penempatan level membaca, kosakata, tata bahasa, dan berbicara (speaking) gratis secara online.",
    url: "https://www.ibraglobalenglish.uk/placement-test",
    type: "website",
    images: [
      {
        url: "/assets/logo.png",
        width: 512,
        height: 512,
        alt: "Ibra Global English Logo",
      }
    ],
  }
};

export default function PlacementTestPage() {
  return <PlacementTestClient />;
}
