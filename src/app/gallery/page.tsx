import { Metadata } from 'next';
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Galeri Kegiatan Siswa | Ibra Global English Bobong",
  description: "Lihat galeri foto dokumentasi keseruan belajar, latihan percakapan, dan kelas interaktif di Ibra Global English Bobong, Pulau Taliabu.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Galeri Kegiatan Siswa | Ibra Global English Bobong",
    description: "Dokumentasi keseruan belajar-mengajar aktif, speaking practice, dan kelas interaktif di Pulau Taliabu.",
    url: "https://www.ibraglobalenglish.uk/gallery",
    type: "website",
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
