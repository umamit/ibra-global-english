import { Metadata } from 'next';
import OfflineFormClient from "./OfflineFormClient";

export const metadata: Metadata = {
  title: "Cetak Formulir Pendaftaran Offline | Ibra Global English Bobong",
  description: "Unduh, cetak, dan isi formulir pendaftaran fisik resmi untuk bergabung dengan program kursus Bahasa Inggris atau bimbingan Calistung Ibra Global English Bobong.",
  alternates: {
    canonical: "https://www.ibraglobalenglish.uk/formulir-offline",
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

import { createBreadcrumbSchema } from '@/utils/seoHelpers';

export default function OfflineFormPage() {
  const breadcrumb = createBreadcrumbSchema([
    { name: "Beranda", url: "https://www.ibraglobalenglish.uk/" },
    { name: "Cetak Formulir Offline", url: "https://www.ibraglobalenglish.uk/formulir-offline" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <OfflineFormClient />
    </>
  );
}
