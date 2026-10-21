import { Metadata } from 'next';
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "Tentang Kami | Ibra Global English (IGE) Bobong",
  description: "Profil lengkap Ibra Global English (IGE) Bobong, visi, misi, legalitas NPSN K7069872, SK Kemenkumham PT Ibra Global English, serta daftar tim pengajar/tutor profesional IGE di Pulau Taliabu.",
  alternates: {
    canonical: "https://www.ibraglobalenglish.uk/about",
  },
  openGraph: {
    title: "Tentang Kami | Ibra Global English (IGE) Bobong",
    description: "Profil lengkap Ibra Global English (IGE) Bobong, visi, misi, legalitas NPSN K7069872, SK Kemenkumham PT Ibra Global English, serta daftar tim pengajar/tutor profesional IGE di Pulau Taliabu.",
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

import { createBreadcrumbSchema } from '@/utils/seoHelpers';

export default function AboutPage() {
  const breadcrumb = createBreadcrumbSchema([
    { name: "Beranda", url: "https://www.ibraglobalenglish.uk/" },
    { name: "Tentang Kami", url: "https://www.ibraglobalenglish.uk/about" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <AboutClient />
    </>
  );
}
