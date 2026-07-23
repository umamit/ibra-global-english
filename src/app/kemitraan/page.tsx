import { Metadata } from "next";
import KemitraanClient from "./KemitraanClient";
import { SITE_CONFIG } from "@/config/siteConfig";

export const metadata: Metadata = {
  title: `Penawaran Kemitraan Sekolah & Instansi | ${SITE_CONFIG.shortName}`,
  description:
    "Program Mitra Rekomendasi Resmi Ibra Global English Bobong untuk Sekolah (SD/SMP/SMA) dan Instansi di Kabupaten Pulau Taliabu. Diagnostic test gratis & voucher siswa mitra.",
  openGraph: {
    title: `Penawaran Kemitraan Sekolah & Instansi | ${SITE_CONFIG.shortName}`,
    description:
      "Program Mitra Rekomendasi Resmi Ibra Global English Bobong untuk Sekolah dan Instansi di Kabupaten Pulau Taliabu.",
    url: `${SITE_CONFIG.url}/kemitraan`,
    siteName: SITE_CONFIG.name,
    locale: "id_ID",
    type: "website",
  },
};

export default function KemitraanPage() {
  return <KemitraanClient />;
}
