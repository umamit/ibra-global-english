import { Metadata } from 'next';
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "Tentang Kami | Ibra Global English Bobong",
  description: "Profil lengkap, visi, misi, legalitas SK Kemenkumham, badan hukum PT Ibra Global English, serta daftar tim pengajar/tutor profesional kami di Pulau Taliabu.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Tentang Kami | Ibra Global English Bobong",
    description: "Profil lengkap, visi, misi, legalitas SK Kemenkumham, badan hukum PT Ibra Global English, serta daftar tim pengajar/tutor profesional kami di Pulau Taliabu.",
    url: "https://www.ibraglobalenglish.uk/about",
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

export default function AboutPage() {
  return <AboutClient />;
}
