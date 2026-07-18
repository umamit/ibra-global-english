import { Metadata } from 'next';
import OfflineFormClient from "./OfflineFormClient";

export const metadata: Metadata = {
  title: "Cetak Formulir Pendaftaran Offline | Ibra Global English Bobong",
  description: "Unduh, cetak, dan isi formulir pendaftaran fisik resmi untuk bergabung dengan program kursus Bahasa Inggris atau bimbingan Calistung Ibra Global English Bobong.",
  alternates: {
    canonical: "/formulir-offline",
  },
  openGraph: {
    title: "Cetak Formulir Pendaftaran Offline | Ibra Global English Bobong",
    description: "Unduh, cetak, dan isi formulir pendaftaran fisik resmi untuk bergabung dengan program kursus Bahasa Inggris atau bimbingan Calistung Ibra Global English Bobong.",
    url: "https://www.ibraglobalenglish.uk/formulir-offline",
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

export default function OfflineFormPage() {
  return <OfflineFormClient />;
}
