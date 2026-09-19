import { Metadata } from 'next';
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Galeri Kegiatan Siswa | Ibra Global English Bobong",
  description: "Lihat galeri foto dokumentasi keseruan belajar, latihan percakapan, dan kelas interaktif di Ibra Global English Bobong, Pulau Taliabu.",
  alternates: {
    canonical: "https://www.ibraglobalenglish.uk/gallery",
  },
  openGraph: {
    title: "Galeri Kegiatan Siswa | Ibra Global English Bobong",
    description: "Dokumentasi keseruan belajar-mengajar aktif, speaking practice, dan kelas interaktif di Pulau Taliabu.",
    url: "https://www.ibraglobalenglish.uk/gallery",
    type: "website",
    images: [
      {
        url: "/assets/logo.png",
        width: 512,
        height: 512,
        alt: "Galeri Ibra Global English Bobong",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galeri Kegiatan Siswa | Ibra Global English Bobong",
    description: "Dokumentasi keseruan belajar-mengajar aktif, speaking practice, dan kelas interaktif di Pulau Taliabu.",
    images: ["/assets/logo.png"],
  }
};

import { createBreadcrumbSchema } from '@/utils/seoHelpers';

export default function GalleryPage() {
  const breadcrumb = createBreadcrumbSchema([
    { name: "Beranda", url: "https://www.ibraglobalenglish.uk/" },
    { name: "Galeri Kegiatan Siswa", url: "https://www.ibraglobalenglish.uk/gallery" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <GalleryClient />
    </>
  );
}
